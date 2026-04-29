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

function simulateEntity({
  entity,
  difficultyConfig,
  questionById,
  rankCandidates,
  selectNextQuestion,
  shouldAttemptGuess,
}) {
  const config = difficultyConfig.normal.readMyMind;
  let asked = [];
  let rejectedGuessIds = [];
  let rankings = rankCandidates(entity.category, asked, rejectedGuessIds, []);
  let wrongEarlyGuesses = 0;
  let repeatedFamilies = 0;
  let previousFamily = null;
  const usedQuestions = [];

  for (let turn = 0; turn < config.maxQuestions; turn += 1) {
    const remainingQuestions = config.maxQuestions - asked.length;
    const leader = rankings[0];
    if (
      leader &&
      shouldAttemptGuess(rankings, config, asked.length, remainingQuestions)
    ) {
      if (leader.entityId === entity.id) {
        return {
          correct: true,
          questions: asked.length,
          wrongEarlyGuesses,
          repeatedFamilies,
          usedQuestions,
        };
      }

      wrongEarlyGuesses += 1;
      rejectedGuessIds = [...rejectedGuessIds, leader.entityId];
      rankings = rankCandidates(entity.category, asked, rejectedGuessIds, []);

      if (wrongEarlyGuesses >= config.maxGuesses) {
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
  return {
    correct: finalLeader === entity.id,
    questions: asked.length,
    wrongEarlyGuesses,
    repeatedFamilies,
    usedQuestions,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { entities } = await loadTsModule(join(ROOT, "lib/data/entities.ts"));
  const { questionById } = await loadTsModule(join(ROOT, "lib/data/questions.ts"));
  const { difficultyConfig } = await loadTsModule(join(ROOT, "lib/game/game-config.ts"));
  const { rankCandidates, shouldAttemptGuess } = await loadTsModule(join(ROOT, "lib/game/scoring.ts"));
  const { selectNextQuestion } = await loadTsModule(join(ROOT, "lib/game/question-selection.ts"));
  const { attributeKeys, entityCategories } = await loadTsModule(join(ROOT, "types/game.ts"));

  const categories = args.category ? [args.category] : entityCategories;
  const questionUse = new Map();
  const categoryReports = [];
  const hardestEntities = [];

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
        shouldAttemptGuess,
      });
      for (const questionId of result.usedQuestions) {
        questionUse.set(questionId, (questionUse.get(questionId) ?? 0) + 1);
      }
      hardestEntities.push({
        id: entity.id,
        name: entity.name,
        category,
        correct: result.correct,
        questions: result.questions,
        wrongEarlyGuesses: result.wrongEarlyGuesses,
        knownAttributes: countKnownAttributes(entity, attributeKeys),
      });
      return result;
    });

    categoryReports.push({
      category,
      sampleSize: sampled.length,
      totalEntities: categoryEntities.length,
      top1Accuracy: Number((results.filter((result) => result.correct).length / results.length).toFixed(3)),
      averageQuestionsToGuess: Number(average(results.map((result) => result.questions)).toFixed(2)),
      wrongEarlyGuessRate: Number((average(results.map((result) => result.wrongEarlyGuesses > 0 ? 1 : 0))).toFixed(3)),
      repeatedFamilyRate: Number((average(results.map((result) => result.repeatedFamilies / Math.max(1, result.questions)))).toFixed(3)),
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
      averageWrongEarlyGuessRate: Number(
        average(categoryReports.map((report) => report.wrongEarlyGuessRate)).toFixed(3),
      ),
      averageRepeatedFamilyRate: Number(
        average(categoryReports.map((report) => report.repeatedFamilyRate)).toFixed(3),
      ),
    },
    mostUsedQuestions: topEntries(questionUse, 12),
    hardestEntities: hardestEntities
      .toSorted((left, right) => {
        if (left.correct !== right.correct) {
          return left.correct ? 1 : -1;
        }
        if (right.wrongEarlyGuesses !== left.wrongEarlyGuesses) {
          return right.wrongEarlyGuesses - left.wrongEarlyGuesses;
        }
        return right.questions - left.questions;
      })
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
