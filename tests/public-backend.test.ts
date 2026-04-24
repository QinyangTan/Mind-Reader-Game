import { describe, expect, it } from "vitest";

import {
  getPublicBackendDiagnostics,
  getLeaderboardSnapshot,
  sanitizeIncomingProfile,
  submitScore,
} from "@/lib/server/public-game-backend";
import type { GameResult, PlayerProfile } from "@/types/game";

function makeProfile(id: string): PlayerProfile {
  return {
    version: 1,
    id,
    displayName: "Server Sage",
    createdAt: "2026-04-23T00:00:00.000Z",
    updatedAt: "2026-04-23T00:00:00.000Z",
  };
}

function makeResult(id: string, score: number): GameResult {
  return {
    id,
    mode: "guess-my-mind",
    category: "fictional_characters",
    difficulty: "normal",
    winner: "player",
    title: "You Broke the Signal",
    message: "test",
    playedAt: "2026-04-23T00:01:00.000Z",
    questionsUsed: 3,
    guessesUsed: 1,
    score,
    scoreBreakdown: {
      total: score,
      base: 35,
      difficultyBonus: 41,
      successBonus: 185,
      questionBonus: 100,
      efficiencyBonus: 70,
      rarityBonus: 0,
      contradictionPenalty: 0,
      guessPenalty: 0,
      cap: 500,
    },
    revealedEntityId: "fiction-test",
    revealedEntityName: "Test Entity",
    teachable: false,
  };
}

describe("public game backend", () => {
  it("sanitizes profiles and aggregates scores by anonymous player id + mode", () => {
    const profile = sanitizeIncomingProfile({
      ...makeProfile(`server-player-${Date.now()}`),
      displayName: "  Server   Sage  ",
    });

    expect(profile.displayName).toBe("Server Sage");

    submitScore(profile, makeResult(`result-${Date.now()}-1`, 180), 2);
    submitScore(profile, makeResult(`result-${Date.now()}-2`, 220), 3);

    const snapshot = getLeaderboardSnapshot("guess-my-mind");
    const entry = snapshot.entries.find((candidate) => candidate.playerId === profile.id);

    expect(snapshot.source).toBe("remote");
    expect(entry?.totalScore).toBe(400);
    expect(entry?.gamesPlayed).toBe(2);
    expect(entry?.bestStreak).toBe(3);
  });

  it("rejects tampered score totals", () => {
    const profile = makeProfile(`tamper-player-${Date.now()}`);

    expect(() =>
      submitScore(
        profile,
        {
          ...makeResult(`tampered-${Date.now()}`, 500),
          scoreBreakdown: {
            ...makeResult("unused", 500).scoreBreakdown,
            total: 499,
          },
        },
        0,
      ),
    ).toThrow("Invalid score.");
  });

  it("exposes production diagnostics without leaking player payloads", () => {
    const diagnostics = getPublicBackendDiagnostics();

    expect(diagnostics.storage).toBe("server-memory");
    expect(diagnostics.profiles).toBeGreaterThanOrEqual(0);
    expect(diagnostics.leaderboardRows).toBeGreaterThanOrEqual(0);
    expect(diagnostics).not.toHaveProperty("profile");
    expect(diagnostics).not.toHaveProperty("leaderboard");
  });
});
