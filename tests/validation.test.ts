import { describe, expect, it } from "vitest";

import { entities } from "@/lib/data/entities";
import { allQuestions } from "@/lib/data/questions";

import { validateSeeds } from "../scripts/validate-seeds";

describe("validateSeeds (shipped data)", () => {
  it("reports no errors against the shipped seed data", () => {
    const report = validateSeeds();

    if (report.errors.length > 0) {
      // Surface the concrete failures in the test output for quick triage.
      console.error("Seed validation errors:\n", JSON.stringify(report.errors, null, 2));
    }

    expect(report.errors).toEqual([]);
  });

  it("ships the expanded five-category content set without vehicles", () => {
    expect(entities).toHaveLength(389);
    expect(allQuestions).toHaveLength(107);
    expect(entities.some((entity) => entity.category === "historical_figures")).toBe(true);
    expect(entities.some((entity) => (entity.category as string) === "vehicles")).toBe(false);
    expect(allQuestions.some((question) => question.supportedCategories.includes("historical_figures"))).toBe(true);
    expect(
      allQuestions.some((question) =>
        question.supportedCategories.some((category) => (category as string) === "vehicles"),
      ),
    ).toBe(false);
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
