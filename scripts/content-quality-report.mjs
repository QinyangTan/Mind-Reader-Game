#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const ROOT = process.cwd();
const requireFromRoot = createRequire(join(ROOT, "package.json"));
const moduleCache = new Map();

const CATEGORY_IDS = [
  "fictional_characters",
  "animals",
  "objects",
  "foods",
  "historical_figures",
];

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

async function resolveTsFile(path) {
  if (path.startsWith("node:") || !path.startsWith("/")) {
    return path;
  }

  if (extname(path)) {
    return path;
  }

  return `${path}.ts`;
}

async function loadTsModule(filePath) {
  const resolved = await resolveTsFile(filePath);

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

    const loaded = loadTsModuleSync(target);
    return loaded;
  };

  const wrapper = vm.runInThisContext(
    `(function(exports, require, module, __filename, __dirname) { ${transpiled}\n})`,
    { filename: resolved },
  );

  wrapper(cjsModule.exports, localRequire, cjsModule, resolved, dirname(resolved));
  return cjsModule.exports;
}

function loadTsModuleSync(filePath) {
  const resolved = extname(filePath) ? filePath : `${filePath}.ts`;

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

function findDuplicates(values) {
  const counts = new Map();
  for (const value of values.filter(Boolean)) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value, count]) => ({ value, count }));
}

function summarizeCoverage(category, entities, questions) {
  const categoryEntities = entities.filter((entity) => entity.category === category);
  const categoryQuestions = questions.filter((question) =>
    question.supportedCategories.includes(category),
  );
  const attributeUse = new Map();
  const stageUse = new Map();
  const familyUse = new Map();

  for (const question of categoryQuestions) {
    attributeUse.set(question.attributeKey, (attributeUse.get(question.attributeKey) ?? 0) + 1);
    stageUse.set(question.stage, (stageUse.get(question.stage) ?? 0) + 1);
    familyUse.set(question.family, (familyUse.get(question.family) ?? 0) + 1);
  }

  return {
    category,
    entities: categoryEntities.length,
    questions: categoryQuestions.length,
    questionToEntityRatio: categoryEntities.length
      ? Number((categoryQuestions.length / categoryEntities.length).toFixed(3))
      : 0,
    stages: Object.fromEntries([...stageUse.entries()].sort()),
    topQuestionFamilies: [...familyUse.entries()]
      .toSorted((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([family, count]) => ({ family, count })),
    usedAttributes: attributeUse.size,
  };
}

function normalizeAlias(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

async function main() {
  const { entities } = await loadTsModule(join(ROOT, "lib/data/entities.ts"));
  const { allQuestions } = await loadTsModule(join(ROOT, "lib/data/questions.ts"));
  const duplicateAliases = findDuplicates(
    entities.flatMap((entity) => (entity.aliases ?? []).map(normalizeAlias)),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      entities: entities.length,
      questions: allQuestions.length,
      categories: CATEGORY_IDS.length,
    },
    categories: CATEGORY_IDS.map((category) =>
      summarizeCoverage(category, entities, allQuestions),
    ),
    duplicateEntityIds: findDuplicates(entities.map((entity) => entity.id)).slice(0, 25),
    duplicateQuestionIds: findDuplicates(allQuestions.map((question) => question.id)).slice(0, 25),
    duplicateAliases: duplicateAliases.slice(0, 25),
    warnings: [],
  };

  for (const summary of report.categories) {
    if (summary.questionToEntityRatio < 0.06) {
      report.warnings.push(
        `${summary.category}: low question/entity ratio (${summary.questions}/${summary.entities}). Add more specialist/fine questions.`,
      );
    }

    if ((summary.stages.fine ?? 0) < 5) {
      report.warnings.push(`${summary.category}: weak fine-detail coverage.`);
    }
  }

  console.log(JSON.stringify(report, null, 2));

  if (report.duplicateEntityIds.length || report.duplicateQuestionIds.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
