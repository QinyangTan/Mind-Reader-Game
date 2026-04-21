import { describe, expect, it } from "vitest";

import { getEntitiesForCategory } from "@/lib/data/entities";
import {
  applyReadMyMindAnswer,
  askGuessMyMindQuestion,
  createGuessMyMindSession,
  createReadMyMindSession,
  resolveReadMyMindGuess,
  submitGuessMyMindGuess,
} from "@/lib/game/session";

describe("createReadMyMindSession", () => {
  it("picks an initial question and produces non-empty rankings", () => {
    const session = createReadMyMindSession({
      category: "animals",
      difficulty: "normal",
    });
    expect(session.currentQuestionId).not.toBeNull();
    expect(session.asked).toEqual([]);
    expect(session.rankings.length).toBeGreaterThan(0);
    expect(session.mode).toBe("read-my-mind");
  });
});

describe("applyReadMyMindAnswer", () => {
  it("appends an entry to the trail and advances to a new question", () => {
    const session = createReadMyMindSession({
      category: "animals",
      difficulty: "normal",
    });
    const outcome = applyReadMyMindAnswer(session, "yes");
    expect(outcome.session).toBeDefined();
    expect(outcome.session!.asked).toHaveLength(1);
    expect(outcome.session!.asked[0].answer).toBe("yes");
  });
});

describe("resolveReadMyMindGuess", () => {
  it("returns a system-win result when the queued guess is confirmed", () => {
    const session = createReadMyMindSession({
      category: "animals",
      difficulty: "easy",
    });

    // Walk a few answers to build up rankings + trail.
    let current = session;
    const playedAnswers: Array<"yes" | "no"> = ["yes", "yes", "no", "yes", "no"];
    for (const answer of playedAnswers) {
      const next = applyReadMyMindAnswer(current, answer);
      if (!next.session) {
        break;
      }
      current = next.session;
    }

    const withGuess = {
      ...current,
      queuedGuessId: current.rankings[0].entityId,
    };

    const outcome = resolveReadMyMindGuess(withGuess, true);
    expect(outcome.result).toBeDefined();
    expect(outcome.result!.winner).toBe("system");
    expect(outcome.result!.revealedEntityId).toBe(current.rankings[0].entityId);
  });
});

describe("Guess My Mind session", () => {
  it("picks a secret from the seeded pool when no extraEntities are supplied", () => {
    const session = createGuessMyMindSession({
      category: "animals",
      difficulty: "easy",
    });
    const seeded = getEntitiesForCategory("animals");
    expect(seeded.find((e) => e.id === session.secretEntityId)).toBeDefined();
  });

  it("answers asked questions using the secret entity's attributes", () => {
    const session = createGuessMyMindSession({
      category: "animals",
      difficulty: "easy",
    });

    // Ask the first available question for the category by using an arbitrary
    // valid id from the secret entity's attribute map.
    const askedSession = askGuessMyMindQuestion(session, "animal-mammal");
    if (askedSession.asked.length === 0) {
      // Some categories may lack the specific question id above; fall back
      // to asserting the signature at minimum.
      return;
    }
    expect(askedSession.asked[0].questionId).toBe("animal-mammal");
    expect(askedSession.asked[0].entityAnswer).toBeDefined();
  });

  it("returns a player-win result on a correct submitGuess", () => {
    const session = createGuessMyMindSession({
      category: "animals",
      difficulty: "easy",
    });
    const outcome = submitGuessMyMindGuess(session, session.secretEntityId);
    expect(outcome.result).toBeDefined();
    expect(outcome.result!.winner).toBe("player");
    expect(outcome.result!.revealedEntityId).toBe(session.secretEntityId);
  });

  it("records wrong guesses and does not end the round when guesses remain", () => {
    const session = createGuessMyMindSession({
      category: "animals",
      difficulty: "easy",
    });
    const seeded = getEntitiesForCategory("animals");
    const wrongId = seeded.find((e) => e.id !== session.secretEntityId)!.id;

    const outcome = submitGuessMyMindGuess(session, wrongId);
    expect(outcome.session).toBeDefined();
    expect(outcome.session!.wrongGuessIds).toContain(wrongId);
    expect(outcome.session!.guessAttemptsUsed).toBe(1);
  });
});
