import { performance } from "node:perf_hooks";

import { describe, expect, it } from "vitest";

import { getQuestionsForCategory } from "@/lib/data/entities";
import { selectNextQuestion } from "@/lib/game/question-selection";
import { rankCandidates } from "@/lib/game/scoring";
import { entityCategories } from "@/types/game";

describe("expanded catalog scale smoke", () => {
  it("still ranks candidates and produces viable opening questions across every category", () => {
    const startedAt = performance.now();

    for (let round = 0; round < 10; round += 1) {
      for (const category of entityCategories) {
        const rankings = rankCandidates(category, [], []);
        const nextQuestion = selectNextQuestion(category, [], rankings);

        expect(rankings.length).toBeGreaterThan(50);
        expect(getQuestionsForCategory(category).length).toBeGreaterThan(20);
        expect(nextQuestion).not.toBeNull();
      }
    }

    const durationMs = performance.now() - startedAt;

    // Relaxed ceiling: enough to catch accidental quadratic blowups without
    // turning normal local variance into flaky failures.
    expect(durationMs).toBeLessThan(6000);
  });
});
