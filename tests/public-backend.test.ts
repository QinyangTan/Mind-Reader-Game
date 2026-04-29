import { describe, expect, it } from "vitest";

import {
  getPublicBackendDiagnostics,
  getLeaderboardSnapshot,
  sanitizeIncomingProfile,
  submitScore,
  verifySubmittedScore,
} from "@/lib/server/public-game-backend";
import type { GameResult, PlayerProfile } from "@/types/game";
import { calculateGameScore } from "@/lib/game/score";

function makeProfile(id: string): PlayerProfile {
  return {
    version: 1,
    id,
    displayName: "Server Sage",
    createdAt: "2026-04-23T00:00:00.000Z",
    updatedAt: "2026-04-23T00:00:00.000Z",
  };
}

function makeResult(id: string): GameResult {
  const scoreBreakdown = calculateGameScore({
    mode: "guess-my-mind",
    difficulty: "normal",
    winner: "player",
    questionsUsed: 3,
    guessesUsed: 1,
  });

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
    score: scoreBreakdown.total,
    scoreBreakdown,
    revealedEntityId: "fiction-test",
    revealedEntityName: "Test Entity",
    teachable: false,
  };
}

describe("public game backend", () => {
  it("sanitizes profiles and aggregates scores by anonymous player id + mode", async () => {
    const profile = sanitizeIncomingProfile({
      ...makeProfile(`server-player-${Date.now()}`),
      displayName: "  Server   Sage  ",
    });

    expect(profile.displayName).toBe("Server Sage");

    const first = makeResult(`result-${Date.now()}-1`);
    const second = makeResult(`result-${Date.now()}-2`);
    await submitScore(profile, first, 2);
    await submitScore(profile, second, 3);

    const snapshot = await getLeaderboardSnapshot("guess-my-mind");
    const entry = snapshot.entries.find((candidate) => candidate.playerId === profile.id);

    expect(snapshot.source).toBe("remote");
    expect(entry?.totalScore).toBe(first.score + second.score);
    expect(entry?.gamesPlayed).toBe(2);
    expect(entry?.bestStreak).toBe(3);
  });

  it("rejects tampered score totals", async () => {
    const profile = makeProfile(`tamper-player-${Date.now()}`);

    await expect(
      submitScore(
        profile,
        {
          ...makeResult(`tampered-${Date.now()}`),
          score: 500,
          scoreBreakdown: {
            ...makeResult("unused").scoreBreakdown,
            total: 500,
          },
        },
        0,
      ),
    ).rejects.toThrow("Score verification failed.");
  });

  it("rejects duplicate score submissions from the same player", async () => {
    const profile = makeProfile(`duplicate-player-${Date.now()}`);
    const result = makeResult(`duplicate-result-${Date.now()}`);

    await submitScore(profile, result, 0);
    await expect(submitScore(profile, result, 0)).rejects.toThrow(
      "Duplicate score submission.",
    );
  });

  it("recomputes score breakdowns from trusted result fields", () => {
    const result = makeResult(`verify-${Date.now()}`);

    expect(verifySubmittedScore(result).total).toBe(result.score);
  });

  it("exposes production diagnostics without leaking player payloads", async () => {
    const diagnostics = await getPublicBackendDiagnostics();

    expect(diagnostics.storage).toBe("server-memory");
    expect(diagnostics.durableConfigured).toBe(false);
    expect(diagnostics.profiles).toBeGreaterThanOrEqual(0);
    expect(diagnostics.leaderboardRows).toBeGreaterThanOrEqual(0);
    expect(diagnostics).not.toHaveProperty("profile");
    expect(diagnostics).not.toHaveProperty("leaderboard");
  });
});
