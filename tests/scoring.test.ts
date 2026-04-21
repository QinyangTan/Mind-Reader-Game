import { describe, expect, it } from "vitest";

import { entityById, getEntitiesForCategory } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import { difficultyConfig } from "@/lib/game/game-config";
import {
  rankCandidates,
  shouldAttemptGuess,
  strongestNarrowingQuestion,
  toProbability,
} from "@/lib/game/scoring";
import type { AnsweredQuestion, RankedCandidate } from "@/types/game";

describe("toProbability", () => {
  it("is monotonic from no → yes", () => {
    expect(toProbability("no")).toBeLessThan(toProbability("probably_not"));
    expect(toProbability("probably_not")).toBeLessThan(toProbability("unknown"));
    expect(toProbability("unknown")).toBeLessThan(toProbability("probably"));
    expect(toProbability("probably")).toBeLessThan(toProbability("yes"));
  });
});

describe("rankCandidates", () => {
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
      candidate("a", cfg.guessConfidence + 0.2),
      candidate("b", 0.01),
    ];
    expect(shouldAttemptGuess(rankings, cfg, cfg.minQuestionsBeforeGuess, 10)).toBe(true);
  });

  it("always guesses when ≤ 1 question remains (deep endgame)", () => {
    const rankings = [candidate("a", 0.12), candidate("b", 0.10)];
    expect(shouldAttemptGuess(rankings, cfg, cfg.minQuestionsBeforeGuess, 1)).toBe(true);
    expect(shouldAttemptGuess(rankings, cfg, cfg.minQuestionsBeforeGuess, 0)).toBe(true);
  });

  it("isolates the narrow-survivor-pool rule (not primary, not endgame)", () => {
    // Leader below guessConfidence, margin below guessMargin (so primary fails),
    // remaining well above the late-fallback window, but ≤ 3 un-rejected
    // candidates and the margin still clears 40 % of guessMargin.
    const rankings = [candidate("a", 0.35), candidate("b", 0.30)];
    expect(shouldAttemptGuess(rankings, cfg, cfg.minQuestionsBeforeGuess, 8)).toBe(true);
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
    // Use a single `probably` answer so hard-contradiction elimination
    // doesn't collapse the top-5 into unanimous agreement on the answered
    // attribute — which would leave the metric with zero split and a
    // correctly-null result.
    const answers: AnsweredQuestion[] = [
      {
        questionId: "fiction-magical",
        attributeKey: "magical",
        prompt: "x",
        answer: "probably",
        askedAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    const rankings = rankCandidates("fictional_characters", answers, []);
    const resolve = (id: string) => entityById.get(id);
    const best = strongestNarrowingQuestion(answers, rankings, resolve);

    // With mixed-polarity survivors, narrowing should be non-null and can
    // only ever name a question that was actually answered.
    if (best !== null) {
      expect(["fiction-magical"]).toContain(best.questionId);
    } else {
      // If seed drift ever makes the top-5 unanimous on `magical`, the
      // metric returns null by design. Surface that path as a soft failure
      // rather than a hard assertion.
      throw new Error(
        "Expected non-null narrowing with a 'probably' answer — seed data may have drifted",
      );
    }
  });
});
