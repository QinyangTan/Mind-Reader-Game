import { describe, expect, it } from "vitest";

import { entityById, getEntitiesForCategory } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import { difficultyConfig } from "@/lib/game/game-config";
import {
  getGuessTimingDiagnostics,
  rankCandidates,
  shouldCommitFinalGuess,
  shouldAttemptGuess,
  strongestNarrowingQuestion,
  toProbability,
} from "@/lib/game/scoring";
import { attributeKeys, type AnsweredQuestion, type GameEntity, type RankedCandidate } from "@/types/game";

describe("toProbability", () => {
  it("is monotonic from no → yes", () => {
    expect(toProbability("no")).toBeLessThan(toProbability("probably_not"));
    expect(toProbability("probably_not")).toBeLessThan(toProbability("unknown"));
    expect(toProbability("unknown")).toBeLessThan(toProbability("probably"));
    expect(toProbability("probably")).toBeLessThan(toProbability("yes"));
  });
});

describe("rankCandidates", () => {
  function objectEntity(
    id: string,
    answers: Partial<GameEntity["attributes"]>,
  ): GameEntity {
    const attributes = Object.fromEntries(attributeKeys.map((key) => [key, "unknown"])) as GameEntity["attributes"];
    return {
      id,
      name: id,
      category: "objects",
      shortDescription: "test object",
      imageEmoji: "🧪",
      attributes: {
        ...attributes,
        real: "yes",
        object: "yes",
        ...answers,
      },
    };
  }

  function answer(questionId: string, response: AnsweredQuestion["answer"]): AnsweredQuestion {
    const question = questionById.get(questionId);
    expect(question).toBeDefined();
    return {
      questionId,
      attributeKey: question!.attributeKey,
      prompt: question!.question,
      answer: response,
      askedAt: "2024-01-01T00:00:00.000Z",
    };
  }

  it("returns all candidates for a fresh round with no rejections", () => {
    const ranked = rankCandidates("fictional_characters", [], []);
    const seededCount = getEntitiesForCategory("fictional_characters").length;
    expect(ranked.length).toBe(seededCount);
    for (const candidate of ranked) {
      expect(candidate.confidence).toBeGreaterThanOrEqual(0);
      expect(candidate.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("excludes rejected ids from the ranking", () => {
    const seeded = getEntitiesForCategory("fictional_characters");
    const rejected = seeded[0];
    const ranked = rankCandidates("fictional_characters", [], [rejected.id]);
    expect(ranked.find((r) => r.entityId === rejected.id)).toBeUndefined();
  });

  it("confidences sum to 1 (within float tolerance)", () => {
    const ranked = rankCandidates("animals", [], []);
    const total = ranked.reduce((sum, r) => sum + r.confidence, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it("calibrates confidence so one thin answer does not overclaim certainty", () => {
    const mammalQ = questionById.get("animal-mammal");
    expect(mammalQ).toBeDefined();

    const ranked = rankCandidates(
      "animals",
      [
        {
          questionId: "animal-mammal",
          attributeKey: "mammal",
          prompt: mammalQ!.question,
          answer: "yes",
          askedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      [],
    );

    expect(ranked[0].confidence).toBeLessThan(0.25);
  });

  it("sinks hard-contradicting candidates below clean ones", () => {
    // `male` is set to an explicit yes/no across the fictional seed via the
    // male↔female cross-population in `seed-helpers.ts`, so both polarities
    // are guaranteed to exist. (Attributes like `magical` only have yes /
    // unknown in the seed — no `no` — so they can't exercise the hard
    // contradiction path reliably.)
    const seeded = getEntitiesForCategory("fictional_characters");
    const maleQ = questionById.get("fiction-male");
    expect(maleQ).toBeDefined();

    const maleEntity = seeded.find((e) => e.attributes.male === "yes");
    const nonMaleEntity = seeded.find((e) => e.attributes.male === "no");
    expect(maleEntity).toBeDefined();
    expect(nonMaleEntity).toBeDefined();

    const answer: AnsweredQuestion = {
      questionId: "fiction-male",
      attributeKey: "male",
      prompt: maleQ!.question,
      answer: "yes",
      askedAt: "2024-01-01T00:00:00.000Z",
    };

    const ranked = rankCandidates("fictional_characters", [answer], []);
    const maleIdx = ranked.findIndex((r) => r.entityId === maleEntity!.id);
    const nonMaleIdx = ranked.findIndex((r) => r.entityId === nonMaleEntity!.id);
    expect(maleIdx).toBeGreaterThanOrEqual(0);
    expect(nonMaleIdx).toBeGreaterThanOrEqual(0);
    expect(maleIdx).toBeLessThan(nonMaleIdx);
  });

  it("keeps contradictions probabilistic so one noisy answer can be outweighed", () => {
    const strongButContradicted = objectEntity("strong-but-contradicted", {
      electronic: "no",
      powered: "yes",
      has_screen: "yes",
      portable: "yes",
      used_daily: "yes",
      indoor_use: "yes",
      office_related: "yes",
      household: "yes",
      kitchen_related: "no",
    });
    const cleanButWeak = objectEntity("clean-but-weak", {
      electronic: "yes",
      powered: "no",
      has_screen: "no",
      portable: "no",
      used_daily: "no",
      indoor_use: "no",
      office_related: "no",
      household: "no",
      kitchen_related: "yes",
    });
    const trail = [
      answer("object-electronic", "yes"),
      answer("object-powered", "yes"),
      answer("object-screen", "yes"),
      answer("object-portable", "yes"),
      answer("object-used-daily", "yes"),
      answer("object-indoor", "yes"),
      answer("object-office", "yes"),
      answer("object-household", "yes"),
      answer("object-kitchen", "no"),
    ];

    const ranked = rankCandidates(
      "objects",
      trail,
      [],
      [strongButContradicted, cleanButWeak],
    );
    const contradicted = ranked.find((entry) => entry.entityId === strongButContradicted.id);
    const weak = ranked.find((entry) => entry.entityId === cleanButWeak.id);

    expect(contradicted).toBeDefined();
    expect(weak).toBeDefined();
    expect(contradicted!.confidence).toBeGreaterThan(0);
    expect(contradicted!.confidence).toBeGreaterThan(weak!.confidence);
  });
});

describe("shouldAttemptGuess", () => {
  const cfg = difficultyConfig.normal.readMyMind;

  const candidate = (entityId: string, confidence: number): RankedCandidate => ({
    entityId,
    score: Math.log(confidence === 0 ? 1e-6 : confidence),
    confidence,
    matchedAnswers: 0,
  });

  it("blocks below minQuestionsBeforeGuess, even with strong signal", () => {
    const rankings = [candidate("a", 0.95), candidate("b", 0.01)];
    expect(shouldAttemptGuess(rankings, cfg, 0, 15)).toBe(false);
    expect(
      shouldAttemptGuess(rankings, cfg, cfg.minQuestionsBeforeGuess - 1, 15),
    ).toBe(false);
  });

  it("fires the primary path when confidence + margin are both met", () => {
    const rankings = [
      candidate("a", cfg.guessConfidence + 0.25),
      candidate("b", 0.01),
    ];
    expect(shouldAttemptGuess(rankings, cfg, cfg.minQuestionsBeforeGuess + 1, 10)).toBe(true);
  });

  it("does not throw away the final available question on weak evidence", () => {
    const rankings = [candidate("a", 0.12), candidate("b", 0.10)];
    expect(shouldAttemptGuess(rankings, cfg, cfg.minQuestionsBeforeGuess + 2, 1)).toBe(false);
    expect(shouldAttemptGuess(rankings, cfg, cfg.minQuestionsBeforeGuess + 2, 0)).toBe(true);
  });

  it("isolates the narrow-survivor-pool rule (not primary, not endgame)", () => {
    // Leader below guessConfidence, margin below guessMargin (so primary fails),
    // remaining well above the late-fallback window, but ≤ 3 un-rejected
    // candidates, low enough effective count, and enough real margin to
    // justify a narrow-pool guess.
    const rankings = [candidate("a", 0.7), candidate("b", 0.06), candidate("c", 0.01)];
    expect(shouldAttemptGuess(rankings, cfg, cfg.minQuestionsBeforeGuess + 3, 8)).toBe(true);
  });

  it("blocks weak-margin guesses even when the leader is slightly ahead", () => {
    const rankings = [
      candidate("a", 0.41),
      candidate("b", 0.34),
      candidate("c", 0.16),
      candidate("d", 0.09),
    ];

    const diagnostics = getGuessTimingDiagnostics(
      rankings,
      cfg,
      cfg.minQuestionsBeforeGuess + 4,
      4,
      "objects",
    );

    expect(diagnostics.shouldGuess).toBe(false);
    expect(diagnostics.reason).toBe("blocked:high_uncertainty");
  });

  it("requires stronger evidence for historically weak categories", () => {
    const rankings = [candidate("a", 0.56), candidate("b", 0.37), candidate("c", 0.05)];

    expect(
      shouldAttemptGuess(
        rankings,
        cfg,
        cfg.minQuestionsBeforeGuess + 1,
        6,
        "historical_figures",
      ),
    ).toBe(false);

    expect(
      shouldAttemptGuess(
        [candidate("a", 0.72), candidate("b", 0.08), candidate("c", 0.02)],
        cfg,
        cfg.minQuestionsBeforeGuess + 4,
        6,
        "historical_figures",
      ),
    ).toBe(true);
  });

  it("allows a late stable leader with strong evidence even when absolute confidence is modest", () => {
    const rankings = [
      { ...candidate("a", 0.07), matchedAnswers: 9, hardContradictions: 0 },
      { ...candidate("b", 0.04), matchedAnswers: 7, hardContradictions: 0 },
      { ...candidate("c", 0.02), matchedAnswers: 5, hardContradictions: 0 },
    ];

    const diagnostics = getGuessTimingDiagnostics(
      rankings,
      cfg,
      cfg.minQuestionsBeforeGuess + 8,
      1,
      "objects",
      { leaderStreak: 5, strongAnswerCount: 9 },
    );

    expect(diagnostics.shouldGuess).toBe(true);
    expect(diagnostics.reason).toBe("late_stable");
  });

  it("keeps final commitment blocked when a stable leader has contradictions", () => {
    const rankings = [
      { ...candidate("a", 0.08), matchedAnswers: 9, hardContradictions: 1 },
      { ...candidate("b", 0.04), matchedAnswers: 7, hardContradictions: 0 },
      { ...candidate("c", 0.02), matchedAnswers: 5, hardContradictions: 0 },
    ];

    expect(
      shouldCommitFinalGuess(rankings, "objects", {
        questionsAsked: 20,
        leaderStreak: 6,
        strongAnswerCount: 9,
      }),
    ).toBe(false);
  });

  it("allows final commitment for a stable clean leader after enough strong answers", () => {
    const rankings = [
      { ...candidate("a", 0.08), matchedAnswers: 9, hardContradictions: 0 },
      { ...candidate("b", 0.04), matchedAnswers: 7, hardContradictions: 0 },
      { ...candidate("c", 0.02), matchedAnswers: 5, hardContradictions: 0 },
    ];

    expect(
      shouldCommitFinalGuess(rankings, "objects", {
        questionsAsked: 20,
        leaderStreak: 6,
        strongAnswerCount: 9,
      }),
    ).toBe(true);
  });
});

describe("strongestNarrowingQuestion", () => {
  it("returns null for an empty trail", () => {
    expect(strongestNarrowingQuestion([], [], () => undefined)).toBeNull();
  });

  it("ignores answers with no narrowing signal (unknown)", () => {
    const answers: AnsweredQuestion[] = [
      {
        questionId: "fiction-magical",
        attributeKey: "magical",
        prompt: "x",
        answer: "unknown",
        askedAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    const rankings = rankCandidates("fictional_characters", [], []);
    const resolve = (id: string) => entityById.get(id);
    expect(strongestNarrowingQuestion(answers, rankings, resolve)).toBeNull();
  });

  it("picks one of the answered questions when the top candidates still disagree", () => {
    const rankedCandidate = (entityId: string, confidence: number): RankedCandidate => ({
      entityId,
      score: Math.log(confidence === 0 ? 1e-6 : confidence),
      confidence,
      matchedAnswers: 0,
    });

    const answers: AnsweredQuestion[] = [
      {
        questionId: "fiction-magical",
        attributeKey: "magical",
        prompt: "x",
        answer: "probably",
        askedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        questionId: "fiction-mask",
        attributeKey: "wears_mask",
        prompt: "y",
        answer: "no",
        askedAt: "2024-01-01T00:00:01.000Z",
      },
    ];

    const fakeEntities = new Map<string, GameEntity>([
      [
        "a",
        {
          ...entityById.get("harry-potter")!,
          id: "a",
          attributes: {
            ...entityById.get("harry-potter")!.attributes,
            magical: "yes",
            wears_mask: "no",
          },
        },
      ],
      [
        "b",
        {
          ...entityById.get("batman")!,
          id: "b",
          attributes: {
            ...entityById.get("batman")!.attributes,
            magical: "no",
            wears_mask: "yes",
          },
        },
      ],
      [
        "c",
        {
          ...entityById.get("doctor-strange")!,
          id: "c",
          attributes: {
            ...entityById.get("doctor-strange")!.attributes,
            magical: "probably",
            wears_mask: "no",
          },
        },
      ],
    ]);

    const rankings: RankedCandidate[] = [
      rankedCandidate("a", 0.38),
      rankedCandidate("b", 0.32),
      rankedCandidate("c", 0.24),
    ];

    const best = strongestNarrowingQuestion(answers, rankings, (id) => fakeEntities.get(id));

    expect(best).not.toBeNull();
    expect(["fiction-magical", "fiction-mask"]).toContain(best!.questionId);
  });
});
