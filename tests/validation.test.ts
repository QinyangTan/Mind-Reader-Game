import { describe, expect, it } from "vitest";

import { animals } from "@/lib/data/animals";
import { animalExpansion, fictionalCharactersExpansion, foodExpansion, objectExpansion } from "@/lib/data/content-expansion";
import {
  animalExpansionV2,
  fictionalCharactersExpansionV2,
  foodExpansionV2,
  objectExpansionV2,
} from "@/lib/data/content-expansion-v2";
import {
  animalExpansionV3,
  fictionalCharactersExpansionV3,
  foodExpansionV3,
  historicalFiguresExpansionV3,
  objectExpansionV3,
} from "@/lib/data/content-expansion-v3";
import {
  animalExpansionV4,
  fictionalCharactersExpansionV4,
  foodExpansionV4,
  historicalFiguresExpansionV4,
  objectExpansionV4,
} from "@/lib/data/content-expansion-v4";
import { entities } from "@/lib/data/entities";
import { fictionalCharacters } from "@/lib/data/fictional-characters";
import { foods } from "@/lib/data/foods";
import { historicalFigures } from "@/lib/data/historical-figures";
import { objects } from "@/lib/data/objects";
import { allQuestions } from "@/lib/data/questions";
import { getEntitiesForCategory, getQuestionsForCategory } from "@/lib/data/entities";
import { questionStages } from "@/types/game";

import { formatCoverageSummary, validateSeeds } from "../scripts/validate-seeds";

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function uniqueByName<T extends { name: string }>(items: readonly T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeName(item.name);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

describe("validateSeeds (shipped data)", () => {
  it("reports no errors against the shipped seed data", () => {
    const report = validateSeeds();

    if (report.errors.length > 0) {
      // Surface the concrete failures in the test output for quick triage.
      console.error("Seed validation errors:\n", JSON.stringify(report.errors, null, 2));
    }

    expect(report.errors).toEqual([]);
  });

  it("ships 500+ new entities per category and a larger layered question bank without vehicles", () => {
    const preV4Fiction = uniqueByName([
      ...fictionalCharacters,
      ...fictionalCharactersExpansion,
      ...fictionalCharactersExpansionV2,
      ...fictionalCharactersExpansionV3,
    ]);
    const preV4Animals = uniqueByName([
      ...animals,
      ...animalExpansion,
      ...animalExpansionV2,
      ...animalExpansionV3,
    ]);
    const preV4Objects = uniqueByName([
      ...objects,
      ...objectExpansion,
      ...objectExpansionV2,
      ...objectExpansionV3,
    ]);
    const preV4Foods = uniqueByName([
      ...foods,
      ...foodExpansion,
      ...foodExpansionV2,
      ...foodExpansionV3,
    ]);
    const preV4Historical = uniqueByName([
      ...historicalFigures,
      ...historicalFiguresExpansionV3,
    ]);

    expect(fictionalCharactersExpansionV4.length).toBeGreaterThanOrEqual(500);
    expect(animalExpansionV4.length).toBeGreaterThanOrEqual(500);
    expect(objectExpansionV4.length).toBeGreaterThanOrEqual(500);
    expect(foodExpansionV4.length).toBeGreaterThanOrEqual(500);
    expect(historicalFiguresExpansionV4.length).toBeGreaterThanOrEqual(500);

    expect(getEntitiesForCategory("fictional_characters").length).toBeGreaterThanOrEqual(
      preV4Fiction.length + 500,
    );
    expect(getEntitiesForCategory("animals").length).toBeGreaterThanOrEqual(
      preV4Animals.length + 500,
    );
    expect(getEntitiesForCategory("objects").length).toBeGreaterThanOrEqual(
      preV4Objects.length + 500,
    );
    expect(getEntitiesForCategory("foods").length).toBeGreaterThanOrEqual(
      preV4Foods.length + 500,
    );
    expect(getEntitiesForCategory("historical_figures").length).toBeGreaterThanOrEqual(
      preV4Historical.length + 500,
    );

    expect(allQuestions.length).toBeGreaterThanOrEqual(350);
    expect(getQuestionsForCategory("fictional_characters").length).toBeGreaterThanOrEqual(55);
    expect(getQuestionsForCategory("animals").length).toBeGreaterThanOrEqual(55);
    expect(getQuestionsForCategory("objects").length).toBeGreaterThanOrEqual(80);
    expect(getQuestionsForCategory("foods").length).toBeGreaterThanOrEqual(80);
    expect(getQuestionsForCategory("historical_figures").length).toBeGreaterThanOrEqual(90);

    for (const category of [
      "fictional_characters",
      "animals",
      "objects",
      "foods",
      "historical_figures",
    ] as const) {
      const stages = new Set(getQuestionsForCategory(category).map((question) => question.stage));
      for (const stage of questionStages) {
        expect(stages.has(stage)).toBe(true);
      }
    }

    expect(entities.length).toBeGreaterThanOrEqual(2800);
    expect(entities.some((entity) => entity.category === "historical_figures")).toBe(true);
    expect(entities.some((entity) => (entity.category as string) === "vehicles")).toBe(false);
    expect(allQuestions.some((question) => question.supportedCategories.includes("historical_figures"))).toBe(true);
    expect(
      allQuestions.some((question) =>
        question.supportedCategories.some((category) => (category as string) === "vehicles"),
      ),
    ).toBe(false);
  });

  it("emits category coverage summaries for scale maintenance", () => {
    const report = validateSeeds();
    const summaryText = formatCoverageSummary(report.summaries);

    expect(report.summaries).toHaveLength(5);
    expect(summaryText).toContain("fictional_characters");
    for (const summary of report.summaries) {
      expect(summary.entityCount).toBeGreaterThan(0);
      expect(summary.questionCount).toBeGreaterThan(0);
      expect(summary.groupCount).toBeGreaterThanOrEqual(4);
      expect(summary.familyCount).toBeGreaterThanOrEqual(6);
      expect(summary.questionsPer100Entities).toBeGreaterThan(3);
    }
  });
});

describe("validateSeeds (fixtures)", () => {
  it("flags duplicate entity ids", () => {
    const one = entities[0];
    const report = validateSeeds({
      entities: [one, { ...one, name: "Alias" }],
      questions: allQuestions,
    });

    expect(report.errors.some((e) => e.code === "duplicate_id" && e.scope === "entities")).toBe(
      true,
    );
  });

  it("flags empty entity display fields", () => {
    const one = entities[0];
    const report = validateSeeds({
      entities: [{ ...one, name: "   " }],
      questions: allQuestions,
    });

    expect(report.errors.some((e) => e.code === "empty_entity_name")).toBe(true);
  });

  it("flags invalid question weight", () => {
    const q = allQuestions[0];
    const report = validateSeeds({
      entities,
      questions: [{ ...q, weight: 0 }],
    });

    expect(report.errors.some((e) => e.code === "invalid_question_weight")).toBe(true);
  });

  it("flags invalid optional entity and question taxonomy metadata", () => {
    const one = entities[0];
    const q = allQuestions[0];
    const report = validateSeeds({
      entities: [{ ...one, popularityWeight: 0 }],
      questions: [
        {
          ...q,
          discriminatorFor: ["not_real" as typeof q.attributeKey],
          requiredBefore: ["missing-question-id"],
        },
      ],
    });

    expect(report.errors.some((e) => e.code === "invalid_entity_weight")).toBe(true);
    expect(report.errors.some((e) => e.code === "invalid_discriminator_attribute")).toBe(true);
    expect(report.errors.some((e) => e.code === "unknown_question_prerequisite")).toBe(true);
  });

  it("flags a category with no supporting questions", () => {
    const animalsOnly = allQuestions.filter((q) =>
      q.supportedCategories.every((c) => c === "animals"),
    );
    expect(animalsOnly.length).toBeGreaterThan(0);

    const report = validateSeeds({
      entities,
      questions: animalsOnly,
    });

    expect(
      report.errors.some(
        (e) =>
          e.code === "no_questions_for_category" &&
          e.message.includes("fictional_characters"),
      ),
    ).toBe(true);
  });
});
