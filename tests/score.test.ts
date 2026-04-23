import { describe, expect, it } from "vitest";

import { calculateGameScore, estimateContradictionPenalty } from "@/lib/game/score";
import type { AnsweredQuestion } from "@/types/game";

const answer = (
  questionId: string,
  attributeKey: AnsweredQuestion["attributeKey"],
  response: AnsweredQuestion["answer"],
): AnsweredQuestion => ({
  questionId,
  attributeKey,
  prompt: questionId,
  answer: response,
  askedAt: "2024-01-01T00:00:00.000Z",
});

describe("calculateGameScore", () => {
  it("is deterministic for identical inputs", () => {
    const input = {
      mode: "guess-my-mind" as const,
      difficulty: "normal" as const,
      winner: "player" as const,
      questionsUsed: 5,
      guessesUsed: 1,
    };

    expect(calculateGameScore(input)).toEqual(calculateGameScore(input));
  });

  it("rewards stumping Mora in Read My Mind more than being guessed", () => {
    const escaped = calculateGameScore({
      mode: "read-my-mind",
      difficulty: "normal",
      winner: "player",
      questionsUsed: 12,
      guessesUsed: 2,
      answers: [],
    });
    const caught = calculateGameScore({
      mode: "read-my-mind",
      difficulty: "normal",
      winner: "system",
      questionsUsed: 12,
      guessesUsed: 1,
      answers: [],
    });

    expect(escaped.total).toBeGreaterThan(caught.total);
  });

  it("rewards efficient correct guesses in Guess My Mind", () => {
    const quick = calculateGameScore({
      mode: "guess-my-mind",
      difficulty: "hard",
      winner: "player",
      questionsUsed: 3,
      guessesUsed: 1,
    });
    const slow = calculateGameScore({
      mode: "guess-my-mind",
      difficulty: "hard",
      winner: "player",
      questionsUsed: 9,
      guessesUsed: 3,
    });

    expect(quick.total).toBeGreaterThan(slow.total);
    expect(quick.total).toBeLessThanOrEqual(quick.cap);
  });

  it("keeps both modes capped and non-negative under extreme inputs", () => {
    const readScore = calculateGameScore({
      mode: "read-my-mind",
      difficulty: "hard",
      winner: "player",
      questionsUsed: 99,
      guessesUsed: 99,
      answers: [],
    });
    const guessScore = calculateGameScore({
      mode: "guess-my-mind",
      difficulty: "hard",
      winner: "player",
      questionsUsed: 0,
      guessesUsed: 99,
    });

    expect(readScore.total).toBeGreaterThanOrEqual(0);
    expect(readScore.total).toBeLessThanOrEqual(readScore.cap);
    expect(guessScore.total).toBeGreaterThanOrEqual(0);
    expect(guessScore.total).toBeLessThanOrEqual(guessScore.cap);
  });

  it("penalizes contradictory Read My Mind answer trails", () => {
    const penalty = estimateContradictionPenalty([
      answer("fiction-male", "male", "yes"),
      answer("fiction-female", "female", "yes"),
      answer("object-large", "large", "probably"),
      answer("object-small", "small", "yes"),
    ]);

    expect(penalty).toBeGreaterThan(0);
  });
});
