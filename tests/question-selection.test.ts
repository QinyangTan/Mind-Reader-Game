import { describe, expect, it } from "vitest";

import { getQuestionsForCategory } from "@/lib/data/entities";
import { selectNextQuestion } from "@/lib/game/question-selection";
import { rankCandidates } from "@/lib/game/scoring";

describe("selectNextQuestion", () => {
  it("returns a question at the start of a fresh round", () => {
    const rankings = rankCandidates("fictional_characters", [], []);
    const next = selectNextQuestion("fictional_characters", [], rankings);
    expect(next).not.toBeNull();
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
});
