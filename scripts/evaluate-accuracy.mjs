#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const ROOT = process.cwd();
const requireFromRoot = createRequire(join(ROOT, "package.json"));
const moduleCache = new Map();
const DEFAULT_LIMIT_PER_CATEGORY = 40;

function resolveModulePath(specifier, fromFile) {
  if (specifier.startsWith("node:")) {
    return specifier;
  }

  if (specifier.startsWith("@/")) {
    return resolve(ROOT, specifier.slice(2));
  }

  if (specifier.startsWith(".")) {
    return resolve(dirname(fromFile), specifier);
  }

  return specifier;
}

function resolveTsFile(path) {
  if (path.startsWith("node:") || !path.startsWith("/")) {
    return path;
  }

  if (extname(path)) {
    return path;
  }

  return `${path}.ts`;
}

async function loadTsModule(filePath) {
  const resolved = resolveTsFile(filePath);

  if (resolved.startsWith("node:") || !resolved.startsWith("/")) {
    return requireFromRoot(resolved);
  }

  if (moduleCache.has(resolved)) {
    return moduleCache.get(resolved).exports;
  }

  const source = await readFile(resolved, "utf8");
  const cjsModule = { exports: {} };
  moduleCache.set(resolved, cjsModule);

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: resolved,
  }).outputText;

  const localRequire = (specifier) => {
    const target = resolveModulePath(specifier, resolved);
    if (target.startsWith("node:") || !target.startsWith("/")) {
      return requireFromRoot(target);
    }
    return loadTsModuleSync(target);
  };

  const wrapper = vm.runInThisContext(
    `(function(exports, require, module, __filename, __dirname) { ${transpiled}\n})`,
    { filename: resolved },
  );

  wrapper(cjsModule.exports, localRequire, cjsModule, resolved, dirname(resolved));
  return cjsModule.exports;
}

function loadTsModuleSync(filePath) {
  const resolved = resolveTsFile(filePath);

  if (moduleCache.has(resolved)) {
    return moduleCache.get(resolved).exports;
  }

  const source = requireFromRoot("node:fs").readFileSync(resolved, "utf8");
  const cjsModule = { exports: {} };
  moduleCache.set(resolved, cjsModule);

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: resolved,
  }).outputText;

  const localRequire = (specifier) => {
    const target = resolveModulePath(specifier, resolved);
    if (target.startsWith("node:") || !target.startsWith("/")) {
      return requireFromRoot(target);
    }
    return loadTsModuleSync(target);
  };

  const wrapper = vm.runInThisContext(
    `(function(exports, require, module, __filename, __dirname) { ${transpiled}\n})`,
    { filename: resolved },
  );

  wrapper(cjsModule.exports, localRequire, cjsModule, resolved, dirname(resolved));
  return cjsModule.exports;
}

function parseArgs(argv) {
  const args = {
    all: false,
    category: null,
    limit: DEFAULT_LIMIT_PER_CATEGORY,
    format: "json",
  };

  for (const arg of argv) {
    if (arg === "--all") {
      args.all = true;
      continue;
    }

    if (arg.startsWith("--category=")) {
      args.category = arg.slice("--category=".length);
      continue;
    }

    if (arg.startsWith("--limit=")) {
      args.limit = Math.max(1, Number(arg.slice("--limit=".length)) || DEFAULT_LIMIT_PER_CATEGORY);
      continue;
    }

    if (arg === "--json") {
      args.format = "json";
      continue;
    }

    if (arg === "--markdown") {
      args.format = "markdown";
      continue;
    }
  }

  return args;
}

function deterministicSample(items, limit) {
  if (items.length <= limit) {
    return items;
  }

  const step = items.length / limit;
  return Array.from({ length: limit }, (_, index) => items[Math.floor(index * step)]);
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function countKnownAttributes(entity, attributeKeys) {
  return attributeKeys.filter((key) => entity.attributes[key] !== "unknown").length;
}

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .toSorted((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([id, count]) => ({ id, count }));
}

function averageNumber(values, digits = 3) {
  return Number(average(values).toFixed(digits));
}

function median(values) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function rankOfEntity(rankings, entityId) {
  const index = rankings.findIndex((candidate) => candidate.entityId === entityId);
  return index >= 0 ? index + 1 : rankings.length + 1;
}

function summarizeStumpReasons(results) {
  const stumps = results.filter((result) => !result.finalCommitted);
  const reasons = {
    confidence_too_low: 0,
    margin_too_low: 0,
    entropy_too_high: 0,
    effective_pool_too_high: 0,
    leader_instability: 0,
    low_known_coverage: 0,
    no_high_value_questions_left: 0,
  };

  for (const result of stumps) {
    if (result.finalConfidence < 0.035) {
      reasons.confidence_too_low += 1;
    }
    if (result.finalMargin < 0.012) {
      reasons.margin_too_low += 1;
    }
    if (result.finalNormalizedEntropy > 0.9) {
      reasons.entropy_too_high += 1;
    }
    if (result.finalEffectiveCandidateCount > 260) {
      reasons.effective_pool_too_high += 1;
    }
    if (result.leaderStreak < 4) {
      reasons.leader_instability += 1;
    }
    if (result.unknownAskedRate > 0.58 || result.unknownAnswerCount > result.questions * 0.45) {
      reasons.low_known_coverage += 1;
    }
    if (result.finalTimingReason === "forced_no_questions") {
      reasons.no_high_value_questions_left += 1;
    }
  }

  const top5AtStump = average(stumps.map((result) => result.top5 ? 1 : 0));
  const top10AtStump = average(stumps.map((result) => result.top10 ? 1 : 0));
  const avgRank = average(stumps.map((result) => result.finalCorrectRank));
  const avgConfidence = average(stumps.map((result) => result.finalConfidence));
  const avgEvidenceQuality = average(stumps.map((result) => result.finalEvidenceQuality ?? 0));
  const avgStrongAnswers = average(stumps.map((result) => result.strongAnswerCount ?? 0));
  const avgHighValueAnswers = average(stumps.map((result) => result.highValueAnswerCount ?? 0));
  const avgUnknownAnswers = average(stumps.map((result) => result.unknownAnswerCount ?? 0));

  let nextBestFix = "balanced threshold calibration";
  if (reasons.low_known_coverage >= stumps.length * 0.45) {
    nextBestFix = "weak entity profiles / missing populated attributes";
  } else if (top10AtStump < 0.35 || avgRank > 40) {
    nextBestFix = "candidate ranking and profile uniqueness";
  } else if (reasons.no_high_value_questions_left >= stumps.length * 0.45) {
    nextBestFix = "more high-coverage specialist/fine questions";
  } else if (top5AtStump >= 0.45 && reasons.margin_too_low < stumps.length * 0.5) {
    nextBestFix = "slightly more permissive final commitment";
  }

  return {
    stumps: stumps.length,
    reasons,
    averageLeaderConfidenceAtStump: Number(avgConfidence.toFixed(4)),
    averageEvidenceQualityAtStump: Number(avgEvidenceQuality.toFixed(3)),
    averageStrongAnswersAtStump: Number(avgStrongAnswers.toFixed(2)),
    averageHighValueAnswersAtStump: Number(avgHighValueAnswers.toFixed(2)),
    averageUnknownAnswersAtStump: Number(avgUnknownAnswers.toFixed(2)),
    averageCorrectAnswerRankAtStump: Number(avgRank.toFixed(2)),
    top5AtStump: Number(top5AtStump.toFixed(3)),
    top10AtStump: Number(top10AtStump.toFixed(3)),
    nextBestFix,
  };
}

function collectMissingSeparators(result, trueEntity, topEntity, questionById) {
  if (!topEntity || result.finalCommitted) {
    return [];
  }

  const separators = [];
  const seen = new Set();
  for (const question of questionById.values()) {
    if (!question.supportedCategories.includes(trueEntity.category)) {
      continue;
    }
    if (seen.has(question.attributeKey)) {
      continue;
    }
    seen.add(question.attributeKey);

    const trueValue = trueEntity.attributes[question.attributeKey];
    const topValue = topEntity.attributes[question.attributeKey];
    if (trueValue === "unknown" && topValue === "unknown") {
      continue;
    }
    if (trueValue !== topValue && (trueValue === "unknown" || topValue === "unknown")) {
      separators.push(question.attributeKey);
    }
  }

  return separators.slice(0, 4);
}

function formatMarkdown(report) {
  const lines = [
    "# Mind Reader Accuracy Evaluation",
    "",
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode} (${report.difficulty})`,
    `Sampling: ${report.sampling}`,
    "",
    "## Totals",
    "",
    `- Simulated entities: ${report.totals.simulatedEntities}`,
    `- Top-1 accuracy: ${report.totals.averageTop1Accuracy}`,
    `- Top-5 accuracy: ${report.totals.averageTop5Accuracy}`,
    `- Top-10 accuracy: ${report.totals.averageTop10Accuracy}`,
    `- Committed guess rate: ${report.totals.averageCommittedGuessRate}`,
    `- Committed guess accuracy: ${report.totals.averageCommittedGuessAccuracy}`,
    `- Wrong committed guess rate: ${report.totals.averageWrongCommittedGuessRate}`,
    `- Stump rate: ${report.totals.averageStumpRate}`,
    `- Wrong early guess rate: ${report.totals.averageWrongEarlyGuessRate}`,
    "",
    "## Categories",
    "",
    "| Category | Top-1 | Top-5 | Top-10 | Commit | Wrong Commit | Stump | Avg Rank | Unknown Asked |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];

  for (const category of report.categories) {
    lines.push(
      `| ${category.category} | ${category.top1Accuracy} | ${category.top5Accuracy} | ${category.top10Accuracy} | ${category.committedGuessRate} | ${category.wrongCommittedGuessRate} | ${category.stumpRate} | ${category.averageFinalCorrectRank} | ${category.unknownAskedRate} |`,
    );
  }

  lines.push("", "## Hardest Entities", "");
  for (const entity of report.hardestEntities.slice(0, 10)) {
    lines.push(
      `- ${entity.name} (${entity.category}) - final rank ${entity.finalCorrectRank}, confidence ${entity.finalConfidence}, known attrs ${entity.knownAttributes}`,
    );
  }

  return `${lines.join("\n")}\n`;
}

function simulateEntity({
  entity,
  difficultyConfig,
  questionById,
  rankCandidates,
  selectNextQuestion,
  getGuessTimingDiagnostics,
  shouldCommitFinalGuess,
  countStrongAnsweredTraits,
  countUnknownAnswers,
  countHighValueAnsweredTraits,
}) {
  const config = difficultyConfig.normal.readMyMind;
  let asked = [];
  let rejectedGuessIds = [];
  let rankings = rankCandidates(entity.category, asked, rejectedGuessIds, []);
  let prematureWrongGuesses = 0;
  let repeatedFamilies = 0;
  let previousFamily = null;
  const usedQuestions = [];
  const timingReasons = new Map();
  let leadingCandidateId = null;
  let leaderStreak = 0;

  while (asked.length < config.maxQuestions) {
    const remainingQuestions = config.maxQuestions - asked.length;
    const leader = rankings[0];
    const strongAnswerCount = countStrongAnsweredTraits(asked);
    const unknownAnswerCount = countUnknownAnswers(asked);
    const highValueAnswerCount = countHighValueAnsweredTraits(asked);
    const timing = getGuessTimingDiagnostics(
      rankings,
      config,
      asked.length,
      remainingQuestions,
      entity.category,
      {
        questionsAsked: asked.length,
        leaderStreak,
        strongAnswerCount,
        unknownAnswerCount,
        highValueAnswerCount,
      },
    );
    timingReasons.set(timing.reason, (timingReasons.get(timing.reason) ?? 0) + 1);

    if (leader && timing.shouldGuess) {
      if (leader.entityId === entity.id) {
        return {
          correct: true,
          questions: asked.length,
          prematureWrongGuesses,
          repeatedFamilies,
          usedQuestions,
          finalGuessId: leader.entityId,
          finalCommitted: true,
          finalConfidence: leader.confidence,
          finalMargin: leader.confidence - (rankings[1]?.confidence ?? 0),
          finalEffectiveCandidateCount: timing.effectiveCandidateCount,
          finalNormalizedEntropy: timing.normalizedEntropy,
          finalEvidenceQuality: timing.evidenceQuality,
          leaderStreak,
          strongAnswerCount,
          unknownAnswerCount,
          highValueAnswerCount,
          finalCorrectRank: 1,
          finalTimingReason: timing.reason,
          topCandidateId: leader.entityId,
          top5: true,
          top10: true,
          unknownAskedRate: average(
            asked.map((answer) => (entity.attributes[answer.attributeKey] === "unknown" ? 1 : 0)),
          ),
          timingReasons,
        };
      }

      prematureWrongGuesses += 1;
      rejectedGuessIds = [...rejectedGuessIds, leader.entityId];
      rankings = rankCandidates(entity.category, asked, rejectedGuessIds, []);

      if (prematureWrongGuesses >= config.maxGuesses) {
        break;
      }
    }

    const nextQuestion = selectNextQuestion(
      entity.category,
      asked.map((entry) => entry.questionId),
      rankings,
      [],
      remainingQuestions,
    );

    if (!nextQuestion) {
      break;
    }

    const question = questionById.get(nextQuestion.id);
    if (question && previousFamily === question.family) {
      repeatedFamilies += 1;
    }
    previousFamily = question?.family ?? null;
    usedQuestions.push(nextQuestion.id);

    asked = [
      ...asked,
      {
        questionId: nextQuestion.id,
        attributeKey: nextQuestion.attributeKey,
        prompt: nextQuestion.question,
        answer: entity.attributes[nextQuestion.attributeKey],
        askedAt: new Date(0).toISOString(),
      },
    ];
    rankings = rankCandidates(entity.category, asked, rejectedGuessIds, []);
    const nextLeaderId = rankings[0]?.entityId ?? null;
    leaderStreak =
      nextLeaderId && nextLeaderId === leadingCandidateId ? leaderStreak + 1 : nextLeaderId ? 1 : 0;
    leadingCandidateId = nextLeaderId;
  }

  const finalLeader = rankings[0]?.entityId;
  const strongAnswerCount = countStrongAnsweredTraits(asked);
  const unknownAnswerCount = countUnknownAnswers(asked);
  const highValueAnswerCount = countHighValueAnsweredTraits(asked);
  const finalCommitted = shouldCommitFinalGuess(rankings, entity.category, {
    questionsAsked: asked.length,
    leaderStreak,
    strongAnswerCount,
    unknownAnswerCount,
    highValueAnswerCount,
  });
  const finalConfidence = rankings[0]?.confidence ?? 0;
  const finalMargin = finalConfidence - (rankings[1]?.confidence ?? 0);
  const finalCorrectRank = rankOfEntity(rankings, entity.id);
  const finalTiming = getGuessTimingDiagnostics(
    rankings,
    config,
    asked.length,
    Math.max(0, config.maxQuestions - asked.length),
    entity.category,
    {
      questionsAsked: asked.length,
      leaderStreak,
      strongAnswerCount,
      unknownAnswerCount,
      highValueAnswerCount,
    },
  );
  timingReasons.set(finalTiming.reason, (timingReasons.get(finalTiming.reason) ?? 0) + 1);

  return {
    correct: finalLeader === entity.id,
    questions: asked.length,
    prematureWrongGuesses,
    repeatedFamilies,
    usedQuestions,
    finalGuessId: finalCommitted ? finalLeader ?? null : null,
    finalCommitted,
    topCandidateId: finalLeader ?? null,
    finalConfidence,
    finalMargin,
    finalEffectiveCandidateCount: finalTiming.effectiveCandidateCount,
    finalNormalizedEntropy: finalTiming.normalizedEntropy,
    finalEvidenceQuality: finalTiming.evidenceQuality,
    leaderStreak,
    strongAnswerCount,
    unknownAnswerCount,
    highValueAnswerCount,
    finalCorrectRank,
    finalTimingReason: finalTiming.reason,
    top5: finalCorrectRank <= 5,
    top10: finalCorrectRank <= 10,
    unknownAskedRate: average(
      asked.map((answer) => (entity.attributes[answer.attributeKey] === "unknown" ? 1 : 0)),
    ),
    timingReasons,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { entities } = await loadTsModule(join(ROOT, "lib/data/entities.ts"));
  const { questionById } = await loadTsModule(join(ROOT, "lib/data/questions.ts"));
  const { difficultyConfig } = await loadTsModule(join(ROOT, "lib/game/game-config.ts"));
  const {
    rankCandidates,
    getGuessTimingDiagnostics,
    shouldCommitFinalGuess,
    countStrongAnsweredTraits,
    countUnknownAnswers,
    countHighValueAnsweredTraits,
  } = await loadTsModule(join(ROOT, "lib/game/scoring.ts"));
  const { selectNextQuestion } = await loadTsModule(join(ROOT, "lib/game/question-selection.ts"));
  const { attributeKeys, entityCategories } = await loadTsModule(join(ROOT, "types/game.ts"));

  const categories = args.category ? [args.category] : entityCategories;
  const questionUse = new Map();
  const questionUtility = new Map();
  const familyUse = new Map();
  const familyUtility = new Map();
  const wrongPairs = new Map();
  const timingReasonUse = new Map();
  const missingSeparatorUse = new Map();
  const categoryReports = [];
  const hardestEntities = [];
  const lowCoverageEntities = [];

  for (const category of categories) {
    const categoryEntities = entities.filter((entity) => entity.category === category);
    const sampled = args.all
      ? categoryEntities
      : deterministicSample(categoryEntities, args.limit);
    const results = sampled.map((entity) => {
      const result = simulateEntity({
        entity,
        difficultyConfig,
        questionById,
        rankCandidates,
        selectNextQuestion,
        getGuessTimingDiagnostics,
        shouldCommitFinalGuess,
        countStrongAnsweredTraits,
        countUnknownAnswers,
        countHighValueAnsweredTraits,
      });
      for (const questionId of result.usedQuestions) {
        questionUse.set(questionId, (questionUse.get(questionId) ?? 0) + 1);
        const question = questionById.get(questionId);
        if (question) {
          const familyKey = `${question.stage}:${question.family}`;
          familyUse.set(familyKey, (familyUse.get(familyKey) ?? 0) + 1);
          if (result.correct || result.top5) {
            questionUtility.set(questionId, (questionUtility.get(questionId) ?? 0) + 1);
            familyUtility.set(familyKey, (familyUtility.get(familyKey) ?? 0) + 1);
          }
        }
      }
      for (const [reason, count] of result.timingReasons) {
        const key = `${category}:${reason}`;
        timingReasonUse.set(key, (timingReasonUse.get(key) ?? 0) + count);
      }
      if (!result.correct && result.finalGuessId) {
        const key = `${result.finalGuessId} -> ${entity.id}`;
        wrongPairs.set(key, (wrongPairs.get(key) ?? 0) + 1);
      }
      const topEntity = result.topCandidateId
        ? entities.find((candidate) => candidate.id === result.topCandidateId)
        : null;
      for (const attributeKey of collectMissingSeparators(result, entity, topEntity, questionById)) {
        const key = `${category}:${attributeKey}`;
        missingSeparatorUse.set(key, (missingSeparatorUse.get(key) ?? 0) + 1);
      }
      const knownAttributes = countKnownAttributes(entity, attributeKeys);
      hardestEntities.push({
        id: entity.id,
        name: entity.name,
        category,
        correct: result.correct,
        questions: result.questions,
        prematureWrongGuesses: result.prematureWrongGuesses,
        finalConfidence: Number(result.finalConfidence.toFixed(4)),
        finalMargin: Number(result.finalMargin.toFixed(4)),
        finalCorrectRank: result.finalCorrectRank,
        leaderStreak: result.leaderStreak,
        knownAttributes,
      });
      lowCoverageEntities.push({
        id: entity.id,
        name: entity.name,
        category,
        knownAttributes,
      });
      return result;
    });

    categoryReports.push({
      category,
      sampleSize: sampled.length,
      totalEntities: categoryEntities.length,
      top1Accuracy: Number((results.filter((result) => result.correct).length / results.length).toFixed(3)),
      top5Accuracy: Number(average(results.map((result) => result.top5 ? 1 : 0)).toFixed(3)),
      top10Accuracy: Number(average(results.map((result) => result.top10 ? 1 : 0)).toFixed(3)),
      committedGuessRate: Number(average(results.map((result) => result.finalCommitted ? 1 : 0)).toFixed(3)),
      committedGuessAccuracy: Number(
        (
          results.filter((result) => result.finalCommitted && result.correct).length /
          Math.max(1, results.filter((result) => result.finalCommitted).length)
        ).toFixed(3),
      ),
      stumpRate: Number(average(results.map((result) => result.finalCommitted ? 0 : 1)).toFixed(3)),
      wrongCommittedGuessRate: Number(
        average(results.map((result) => result.finalCommitted && !result.correct ? 1 : 0)).toFixed(3),
      ),
      averageQuestionsToGuess: averageNumber(results.map((result) => result.questions), 2),
      averageFinalCorrectRank: averageNumber(results.map((result) => result.finalCorrectRank), 2),
      medianFinalCorrectRank: Number(median(results.map((result) => result.finalCorrectRank)).toFixed(2)),
      wrongEarlyGuessRate: Number((average(results.map((result) => result.prematureWrongGuesses > 0 ? 1 : 0))).toFixed(3)),
      averageFinalConfidence: averageNumber(results.map((result) => result.finalConfidence), 3),
      averageFinalMargin: averageNumber(results.map((result) => result.finalMargin), 3),
      averageEffectiveCandidateCount: averageNumber(results.map((result) => result.finalEffectiveCandidateCount), 2),
      averageNormalizedEntropy: averageNumber(results.map((result) => result.finalNormalizedEntropy), 3),
      averageLeaderStreak: averageNumber(results.map((result) => result.leaderStreak), 2),
      unknownAskedRate: Number(average(results.map((result) => result.unknownAskedRate)).toFixed(3)),
      repeatedFamilyRate: Number((average(results.map((result) => result.repeatedFamilies / Math.max(1, result.questions)))).toFixed(3)),
      stumpAnalysis: {
        ...summarizeStumpReasons(results),
        missingAttributesThatWouldSeparateLeaders: topEntries(
          new Map(
            [...missingSeparatorUse.entries()]
              .filter(([key]) => key.startsWith(`${category}:`))
              .map(([key, count]) => [key.slice(category.length + 1), count]),
          ),
          8,
        ),
      },
      guessTimingReasons: Object.fromEntries(
        [...timingReasonUse.entries()]
          .filter(([key]) => key.startsWith(`${category}:`))
          .map(([key, count]) => [key.slice(category.length + 1), count]),
      ),
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: "read-my-mind",
    difficulty: "normal",
    sampling: args.all ? "all" : `deterministic ${args.limit} per category`,
    categories: categoryReports,
    totals: {
      simulatedEntities: categoryReports.reduce((sum, report) => sum + report.sampleSize, 0),
      averageQuestionsToGuess: Number(
        average(categoryReports.map((report) => report.averageQuestionsToGuess)).toFixed(2),
      ),
      averageTop1Accuracy: Number(
        average(categoryReports.map((report) => report.top1Accuracy)).toFixed(3),
      ),
      averageTop5Accuracy: Number(
        average(categoryReports.map((report) => report.top5Accuracy)).toFixed(3),
      ),
      averageTop10Accuracy: Number(
        average(categoryReports.map((report) => report.top10Accuracy)).toFixed(3),
      ),
      averageCommittedGuessRate: Number(
        average(categoryReports.map((report) => report.committedGuessRate)).toFixed(3),
      ),
      averageCommittedGuessAccuracy: Number(
        average(categoryReports.map((report) => report.committedGuessAccuracy)).toFixed(3),
      ),
      averageStumpRate: Number(
        average(categoryReports.map((report) => report.stumpRate)).toFixed(3),
      ),
      averageWrongCommittedGuessRate: Number(
        average(categoryReports.map((report) => report.wrongCommittedGuessRate)).toFixed(3),
      ),
      averageWrongEarlyGuessRate: Number(
        average(categoryReports.map((report) => report.wrongEarlyGuessRate)).toFixed(3),
      ),
      averageRepeatedFamilyRate: Number(
        average(categoryReports.map((report) => report.repeatedFamilyRate)).toFixed(3),
      ),
    },
    mostUsedQuestions: topEntries(questionUse, 12),
    mostUsefulQuestions: topEntries(questionUtility, 12),
    questionFamilyUsage: topEntries(familyUse, 14),
    questionFamilyUtility: topEntries(familyUtility, 14),
    commonWrongGuessPairs: topEntries(wrongPairs, 12),
    hardestEntities: hardestEntities
      .toSorted((left, right) => {
        if (left.correct !== right.correct) {
          return left.correct ? 1 : -1;
        }
        if (right.prematureWrongGuesses !== left.prematureWrongGuesses) {
          return right.prematureWrongGuesses - left.prematureWrongGuesses;
        }
        return right.finalCorrectRank - left.finalCorrectRank || right.questions - left.questions;
      })
      .slice(0, 16),
    lowestCoverageEntities: lowCoverageEntities
      .toSorted((left, right) => left.knownAttributes - right.knownAttributes)
      .slice(0, 16),
    weakestCategories: categoryReports
      .toSorted((left, right) => {
        if (left.top1Accuracy !== right.top1Accuracy) {
          return left.top1Accuracy - right.top1Accuracy;
        }
        return right.averageQuestionsToGuess - left.averageQuestionsToGuess;
      })
      .slice(0, 5)
      .map((report) => report.category),
  };

  if (args.format === "markdown") {
    console.log(formatMarkdown(report));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
