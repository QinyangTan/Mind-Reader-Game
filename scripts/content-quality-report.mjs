#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "lib", "data");
const CATEGORY_IDS = [
  "fictional_characters",
  "animals",
  "objects",
  "foods",
  "historical_figures",
];

async function listTsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTsFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(path);
    }
  }

  return files;
}

function unique(values) {
  return [...new Set(values)];
}

function collectMatches(content, regex, group = 1) {
  return [...content.matchAll(regex)].map((match) => match[group]).filter(Boolean);
}

function summarizeCoverage(category, entities, questions) {
  const categoryEntityIds = entities
    .filter((entity) => entity.category === category)
    .map((entity) => entity.id);
  const categoryQuestions = questions.filter((question) => question.categories.includes(category));
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
    entities: categoryEntityIds.length,
    questions: categoryQuestions.length,
    questionToEntityRatio: categoryEntityIds.length
      ? Number((categoryQuestions.length / categoryEntityIds.length).toFixed(3))
      : 0,
    stages: Object.fromEntries([...stageUse.entries()].sort()),
    topQuestionFamilies: [...familyUse.entries()]
      .toSorted((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([family, count]) => ({ family, count })),
    usedAttributes: attributeUse.size,
  };
}

function findDuplicates(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count }));
}

async function main() {
  const files = await listTsFiles(DATA_DIR);
  const entities = [];
  const questions = [];
  const aliasValues = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const rel = relative(ROOT, file);

    const ids = collectMatches(content, /id:\s*"([^"]+)"/g);
    const entityCategories = collectMatches(content, /category:\s*"([^"]+)"/g);
    const supportedCategoryBlocks = collectMatches(content, /supportedCategories:\s*\[([^\]]+)\]/g);
    const stages = collectMatches(content, /stage:\s*"([^"]+)"/g);
    const families = collectMatches(content, /family:\s*"([^"]+)"/g);
    const attributes = collectMatches(content, /attributeKey:\s*"([^"]+)"/g);
    const aliasBlocks = collectMatches(content, /aliases:\s*\[([^\]]+)\]/g);

    for (const block of aliasBlocks) {
      aliasValues.push(...collectMatches(block, /"([^"]+)"/g).map((alias) => alias.toLowerCase()));
    }

    // Entity records have `category`; question records have `supportedCategories`.
    for (let index = 0; index < Math.min(ids.length, entityCategories.length); index += 1) {
      if (CATEGORY_IDS.includes(entityCategories[index])) {
        entities.push({ id: ids[index], category: entityCategories[index], file: rel });
      }
    }

    for (let index = 0; index < supportedCategoryBlocks.length; index += 1) {
      questions.push({
        id: ids[index] ?? `${rel}:question:${index}`,
        categories: collectMatches(supportedCategoryBlocks[index], /"([^"]+)"/g),
        stage: stages[index] ?? "unknown",
        family: families[index] ?? "unknown",
        attributeKey: attributes[index] ?? "unknown",
        file: rel,
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      entities: entities.length,
      questions: questions.length,
      entityFiles: unique(entities.map((entity) => entity.file)).length,
      questionFiles: unique(questions.map((question) => question.file)).length,
    },
    categories: CATEGORY_IDS.map((category) => summarizeCoverage(category, entities, questions)),
    duplicateEntityIds: findDuplicates(entities.map((entity) => entity.id)).slice(0, 25),
    duplicateQuestionIds: findDuplicates(questions.map((question) => question.id)).slice(0, 25),
    duplicateAliases: findDuplicates(aliasValues).slice(0, 25),
    warnings: [],
  };

  for (const summary of report.categories) {
    if (summary.questionToEntityRatio < 0.08) {
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
