import { describe, expect, it } from "vitest";

import { computeInferenceRanking } from "@/lib/game/inference-worker-client";

describe("computeInferenceRanking", () => {
  it("caches identical ranking requests so repeated browser work is cheap", async () => {
    const input = {
      category: "animals" as const,
      asked: [],
      rejectedGuessIds: [],
      askedQuestionIds: [],
      remainingQuestions: 12,
      extraEntities: [],
    };

    const first = await computeInferenceRanking(input);
    const second = await computeInferenceRanking(input);

    expect(first.rankedCandidates.length).toBeGreaterThan(0);
    expect(first.rankedQuestions.length).toBeGreaterThan(0);
    expect(second.source).toBe("cache");
    expect(second.rankedCandidates[0]?.entityId).toBe(first.rankedCandidates[0]?.entityId);
    expect(second.rankedQuestions[0]?.question.id).toBe(first.rankedQuestions[0]?.question.id);
  });
});
