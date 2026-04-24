import { describe, expect, it } from "vitest";

import { getQuestionsForCategory } from "@/lib/data/entities";
import {
  determineTargetQuestionStage,
  rankAvailableQuestions,
  selectNextQuestion,
} from "@/lib/game/question-selection";
import { rankCandidates } from "@/lib/game/scoring";
import { attributeKeys, type EntityCategory, type GameEntity, type RankedCandidate } from "@/types/game";

function makeEntity(
  id: string,
  category: EntityCategory,
  answers: Partial<GameEntity["attributes"]>,
): GameEntity {
  const attributes = Object.fromEntries(attributeKeys.map((key) => [key, "unknown"])) as GameEntity["attributes"];
  return {
    id,
    name: id,
    category,
    shortDescription: "test entity",
    imageEmoji: "🧪",
    attributes: {
      ...attributes,
      ...answers,
    },
  };
}

function ranked(entityId: string, confidence: number): RankedCandidate {
  return {
    entityId,
    score: Math.log(confidence === 0 ? 1e-6 : confidence),
    confidence,
    matchedAnswers: 0,
  };
}

describe("selectNextQuestion", () => {
  it("returns a question at the start of a fresh round", () => {
    const rankings = rankCandidates("fictional_characters", [], []);
    const next = selectNextQuestion("fictional_characters", [], rankings);
    expect(next).not.toBeNull();
    expect(["broad", "category"]).toContain(next!.stage);
  });

  it("returns null once every category question has been asked", () => {
    const all = getQuestionsForCategory("fictional_characters").map((q) => q.id);
    const rankings = rankCandidates("fictional_characters", [], []);
    const next = selectNextQuestion("fictional_characters", all, rankings);
    expect(next).toBeNull();
  });

  it("never returns an already-asked question", () => {
    const all = getQuestionsForCategory("fictional_characters");
    const askedIds = [all[0].id, all[1].id, all[2].id];
    const rankings = rankCandidates("fictional_characters", [], []);
    const next = selectNextQuestion("fictional_characters", askedIds, rankings);
    expect(next).not.toBeNull();
    expect(askedIds).not.toContain(next!.id);
  });

  it("treats an already-asked attribute as spent across alternate phrasings", () => {
    const rankings = rankCandidates("objects", [], []);
    const rankedQuestions = rankAvailableQuestions("objects", ["object-metal"], rankings, [], 8);

    expect(
      rankedQuestions.some((entry) => entry.question.id === "object-metal-body"),
    ).toBe(false);
  });

  it("penalizes repeating the same question family when a similarly useful alternative exists", () => {
    const extraEntities: GameEntity[] = [
      makeEntity("desk-lamp", "objects", {
        real: "yes",
        object: "yes",
        office_related: "yes",
        used_daily: "yes",
        kitchen_related: "no",
      }),
      makeEntity("school-notebook", "objects", {
        real: "yes",
        object: "yes",
        office_related: "yes",
        used_daily: "yes",
        kitchen_related: "no",
      }),
      makeEntity("mixing-bowl", "objects", {
        real: "yes",
        object: "yes",
        office_related: "no",
        used_daily: "no",
        kitchen_related: "yes",
      }),
      makeEntity("chef-knife", "objects", {
        real: "yes",
        object: "yes",
        office_related: "no",
        used_daily: "no",
        kitchen_related: "yes",
      }),
    ];

    const rankings = [
      ranked("desk-lamp", 0.25),
      ranked("school-notebook", 0.25),
      ranked("mixing-bowl", 0.25),
      ranked("chef-knife", 0.25),
    ];
    const askedIds = ["object-portable", "object-electronic", "object-household", "object-kitchen"];

    const rankedQuestions = rankAvailableQuestions("objects", askedIds, rankings, extraEntities, 8);

    const officeIdx = rankedQuestions.findIndex((entry) => entry.question.id === "object-office");
    const dailyIdx = rankedQuestions.findIndex((entry) => entry.question.id === "object-used-daily");

    expect(officeIdx).toBeGreaterThanOrEqual(0);
    expect(dailyIdx).toBeGreaterThanOrEqual(0);
    expect(dailyIdx).toBeLessThan(officeIdx);
  });

  it("keeps the opening layer broad on a fresh category with high uncertainty", () => {
    const rankings = rankCandidates("objects", [], []);
    const rankedQuestions = rankAvailableQuestions("objects", [], rankings, [], 12);

    expect(rankedQuestions[0]).toBeDefined();
    expect(["broad", "category"]).toContain(rankedQuestions[0].question.stage);
    expect(rankedQuestions[0].targetStage).toBe("broad");
  });

  it("moves into fine questions when the candidate pool is already narrow", () => {
    const target = determineTargetQuestionStage(
      [ranked("a", 0.82), ranked("b", 0.12), ranked("c", 0.06)],
      8,
      6,
    );

    expect(["specialist", "fine"]).toContain(target);
  });

  it("keeps repetitive family choices below diverse alternatives in the scoring metadata", () => {
    const rankings = rankCandidates("objects", [], []);
    const rankedQuestions = rankAvailableQuestions(
      "objects",
      ["object-portable", "object-household", "object-kitchen"],
      rankings,
      [],
      8,
    );

    const repeated = rankedQuestions.find((entry) => entry.question.family === "room-context");
    const diverse = rankedQuestions.find((entry) => entry.question.family !== "room-context");

    expect(repeated).toBeDefined();
    expect(diverse).toBeDefined();
    expect(repeated!.repetitionMultiplier).toBeLessThanOrEqual(1);
  });

  it("prioritizes the question most likely to create a decisive leader in endgame", () => {
    const extraEntities: GameEntity[] = [
      makeEntity("tablet-like", "objects", {
        real: "yes",
        object: "yes",
        electronic: "yes",
        powered: "yes",
        portable: "yes",
        has_screen: "yes",
        used_daily: "yes",
        office_related: "yes",
      }),
      makeEntity("headphones-like", "objects", {
        real: "yes",
        object: "yes",
        electronic: "yes",
        powered: "yes",
        portable: "yes",
        has_screen: "no",
        used_daily: "yes",
        office_related: "yes",
      }),
    ];
    const rankings = [ranked("tablet-like", 0.52), ranked("headphones-like", 0.48)];

    const rankedQuestions = rankAvailableQuestions(
      "objects",
      ["object-electronic", "object-powered", "object-portable"],
      rankings,
      extraEntities,
      4,
    );

    const screenQuestion = rankedQuestions.find((entry) => entry.question.id === "object-screen");
    const dailyQuestion = rankedQuestions.find((entry) => entry.question.id === "object-used-daily");

    expect(screenQuestion).toBeDefined();
    expect(dailyQuestion).toBeDefined();
    expect(screenQuestion!.expectedMargin).toBeGreaterThan(dailyQuestion!.expectedMargin);
    expect(
      rankedQuestions.findIndex((entry) => entry.question.id === "object-screen"),
    ).toBeLessThan(
      rankedQuestions.findIndex((entry) => entry.question.id === "object-used-daily"),
    );
  });

  it("penalizes low-coverage questions when likely candidates have unknown profile values", () => {
    const extraEntities: GameEntity[] = [
      makeEntity("office-a", "objects", {
        real: "yes",
        object: "yes",
        office_related: "yes",
        has_screen: "unknown",
      }),
      makeEntity("office-b", "objects", {
        real: "yes",
        object: "yes",
        office_related: "yes",
        has_screen: "unknown",
      }),
      makeEntity("home-a", "objects", {
        real: "yes",
        object: "yes",
        office_related: "no",
        has_screen: "unknown",
      }),
      makeEntity("home-b", "objects", {
        real: "yes",
        object: "yes",
        office_related: "no",
        has_screen: "unknown",
      }),
    ];
    const rankings = [
      ranked("office-a", 0.26),
      ranked("office-b", 0.24),
      ranked("home-a", 0.26),
      ranked("home-b", 0.24),
    ];

    const rankedQuestions = rankAvailableQuestions(
      "objects",
      ["object-electronic", "object-powered", "object-portable"],
      rankings,
      extraEntities,
      5,
    );

    const officeQuestion = rankedQuestions.find((entry) => entry.question.id === "object-office");
    const screenQuestion = rankedQuestions.find((entry) => entry.question.id === "object-screen");

    expect(officeQuestion).toBeDefined();
    expect(screenQuestion).toBeDefined();
    expect(officeQuestion!.profileCoverage).toBeGreaterThan(screenQuestion!.profileCoverage);
    expect(officeQuestion!.score).toBeGreaterThan(screenQuestion!.score);
  });
});
