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

function simulateEntity({
  entity,
  difficultyConfig,
  questionById,
  rankCandidates,
  selectNextQuestion,
  getGuessTimingDiagnostics,
  shouldCommitFinalGuess,
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

  while (asked.length < config.maxQuestions) {
    const remainingQuestions = config.maxQuestions - asked.length;
    const leader = rankings[0];
    const timing = getGuessTimingDiagnostics(
      rankings,
      config,
      asked.length,
      remainingQuestions,
      entity.category,
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
  }

  const finalLeader = rankings[0]?.entityId;
  const finalCommitted = shouldCommitFinalGuess(rankings, entity.category);
  const finalConfidence = rankings[0]?.confidence ?? 0;
  const finalMargin = finalConfidence - (rankings[1]?.confidence ?? 0);
  const finalTiming = getGuessTimingDiagnostics(
    rankings,
    config,
    asked.length,
    Math.max(0, config.maxQuestions - asked.length),
    entity.category,
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
    timingReasons,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { entities } = await loadTsModule(join(ROOT, "lib/data/entities.ts"));
  const { questionById } = await loadTsModule(join(ROOT, "lib/data/questions.ts"));
  const { difficultyConfig } = await loadTsModule(join(ROOT, "lib/game/game-config.ts"));
  const { rankCandidates, getGuessTimingDiagnostics, shouldCommitFinalGuess } = await loadTsModule(join(ROOT, "lib/game/scoring.ts"));
  const { selectNextQuestion } = await loadTsModule(join(ROOT, "lib/game/question-selection.ts"));
  const { attributeKeys, entityCategories } = await loadTsModule(join(ROOT, "types/game.ts"));

  const categories = args.category ? [args.category] : entityCategories;
  const questionUse = new Map();
  const wrongPairs = new Map();
  const timingReasonUse = new Map();
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
      });
      for (const questionId of result.usedQuestions) {
        questionUse.set(questionId, (questionUse.get(questionId) ?? 0) + 1);
      }
      for (const [reason, count] of result.timingReasons) {
        const key = `${category}:${reason}`;
        timingReasonUse.set(key, (timingReasonUse.get(key) ?? 0) + count);
      }
      if (!result.correct && result.finalGuessId) {
        const key = `${result.finalGuessId} -> ${entity.id}`;
        wrongPairs.set(key, (wrongPairs.get(key) ?? 0) + 1);
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
      wrongEarlyGuessRate: Number((average(results.map((result) => result.prematureWrongGuesses > 0 ? 1 : 0))).toFixed(3)),
      averageFinalConfidence: averageNumber(results.map((result) => result.finalConfidence), 3),
      averageFinalMargin: averageNumber(results.map((result) => result.finalMargin), 3),
      averageEffectiveCandidateCount: averageNumber(results.map((result) => result.finalEffectiveCandidateCount), 2),
      averageNormalizedEntropy: averageNumber(results.map((result) => result.finalNormalizedEntropy), 3),
      repeatedFamilyRate: Number((average(results.map((result) => result.repeatedFamilies / Math.max(1, result.questions)))).toFixed(3)),
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
    commonWrongGuessPairs: topEntries(wrongPairs, 12),
    hardestEntities: hardestEntities
      .toSorted((left, right) => {
        if (left.correct !== right.correct) {
          return left.correct ? 1 : -1;
        }
        if (right.prematureWrongGuesses !== left.prematureWrongGuesses) {
          return right.prematureWrongGuesses - left.prematureWrongGuesses;
        }
        return right.questions - left.questions;
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

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
