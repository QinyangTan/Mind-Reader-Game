import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadLearnedEntities } from "@/lib/game/learned-storage";
import {
  applyResultToStats,
  averageQuestionsForMode,
  defaultStats,
  loadVault,
  playerGuessAccuracy,
  systemGuessAccuracy,
  winRateForMode,
} from "@/lib/game/storage";
import type { GameResult } from "@/types/game";

const VAULT_KEY = "mind-reader.v1";
const LEARNED_KEY = "mind-reader.learned.v1";

function stubLocalStorage() {
  const store: Record<string, string> = {};
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) {
          delete store[k];
        }
      },
    },
  });
  return store;
}

describe("loadVault", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = stubLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the default vault when storage is empty", () => {
    const vault = loadVault();
    expect(vault.version).toBe(2);
    expect(vault.stats.totalGames).toBe(0);
    expect(vault.history).toEqual([]);
  });

  it("migrates a v1 payload: moves teachCases into the learned store and rewrites the vault at v2", () => {
    store[VAULT_KEY] = JSON.stringify({
      version: 1,
      settings: {
        mode: "read-my-mind",
        category: "animals",
        difficulty: "easy",
        soundEnabled: false,
        useTeachCases: true,
      },
      stats: defaultStats,
      history: [],
      teachCases: [
        {
          id: "teach-1",
          createdAt: "2024-01-01T00:00:00.000Z",
          category: "animals",
          difficulty: "easy",
          entityName: "Otter",
          note: "Floats on back",
          answers: [],
        },
      ],
    });

    const vault = loadVault();
    expect(vault.version).toBe(2);

    const rewritten = JSON.parse(store[VAULT_KEY]) as Record<string, unknown>;
    expect(rewritten.version).toBe(2);
    expect(rewritten.teachCases).toBeUndefined();

    const learned = JSON.parse(store[LEARNED_KEY]) as { entries: unknown[] };
    expect(learned.entries).toHaveLength(1);
    expect((learned.entries[0] as { id: string }).id).toBe("teach-1");
  });

  it("is idempotent across repeated loads", () => {
    store[VAULT_KEY] = JSON.stringify({
      version: 1,
      stats: defaultStats,
      history: [],
      teachCases: [
        {
          id: "t1",
          createdAt: "2024-01-01T00:00:00.000Z",
          category: "animals",
          difficulty: "easy",
          entityName: "A",
          note: "",
          answers: [],
        },
      ],
    });

    loadVault();
    const first = loadLearnedEntities();
    expect(first.entries).toHaveLength(1);

    loadVault();
    const second = loadLearnedEntities();
    expect(second.entries).toHaveLength(1);
  });

  it("tolerates a corrupt payload by returning the default vault", () => {
    store[VAULT_KEY] = "{{ not valid json";
    const vault = loadVault();
    expect(vault.version).toBe(2);
    expect(vault.stats.totalGames).toBe(0);
  });
});

describe("applyResultToStats", () => {
  const baseRmmSystemWin: GameResult = {
    id: "r1",
    mode: "read-my-mind",
    category: "fictional_characters",
    difficulty: "normal",
    winner: "system",
    title: "Scanner Lock Confirmed",
    message: "...",
    playedAt: "2024-01-01T00:00:00.000Z",
    questionsUsed: 9,
    guessesUsed: 1,
    teachable: false,
  };

  it("increments totalGames, byMode, byCategory, byDifficulty, questionsByMode", () => {
    const after = applyResultToStats(defaultStats, baseRmmSystemWin);
    expect(after.totalGames).toBe(1);
    expect(after.byMode["read-my-mind"]).toBe(1);
    expect(after.byCategory.fictional_characters).toBe(1);
    expect(after.byDifficulty.normal).toBe(1);
    expect(after.questionsByMode["read-my-mind"]).toBe(9);
  });

  it("attributes a system RMM win to systemGuess counters, not player ones", () => {
    const after = applyResultToStats(defaultStats, baseRmmSystemWin);
    expect(after.systemGuessAttempts).toBe(1);
    expect(after.systemGuessHits).toBe(1);
    expect(after.playerGuessAttempts).toBe(0);
    expect(after.playerGuessHits).toBe(0);
    expect(after.winsByMode["read-my-mind"]).toBe(0);
    expect(after.winsByDifficulty.normal).toBe(0);
    expect(after.winsByCategory.fictional_characters).toBe(0);
  });

  it("attributes a player GMM win to playerGuess counters and winsByMode/Category/Difficulty", () => {
    const gmmPlayerWin: GameResult = {
      ...baseRmmSystemWin,
      mode: "guess-my-mind",
      category: "animals",
      difficulty: "hard",
      winner: "player",
      guessesUsed: 2,
    };
    const after = applyResultToStats(defaultStats, gmmPlayerWin);
    expect(after.playerGuessAttempts).toBe(2);
    expect(after.playerGuessHits).toBe(1);
    expect(after.systemGuessAttempts).toBe(0);
    expect(after.winsByMode["guess-my-mind"]).toBe(1);
    expect(after.winsByCategory.animals).toBe(1);
    expect(after.winsByDifficulty.hard).toBe(1);
  });

  it("resets currentStreak on a system win and advances bestStreak on a run of player wins", () => {
    const playerWin: GameResult = {
      ...baseRmmSystemWin,
      mode: "guess-my-mind",
      winner: "player",
    };

    let stats = defaultStats;
    stats = applyResultToStats(stats, playerWin);
    stats = applyResultToStats(stats, playerWin);
    stats = applyResultToStats(stats, playerWin);
    expect(stats.currentStreak).toBe(3);
    expect(stats.bestStreak).toBe(3);

    stats = applyResultToStats(stats, baseRmmSystemWin);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(3);
  });
});

describe("derived metric helpers", () => {
  it("return 0 for every ratio/average when no data exists", () => {
    expect(averageQuestionsForMode(defaultStats, "read-my-mind")).toBe(0);
    expect(averageQuestionsForMode(defaultStats, "guess-my-mind")).toBe(0);
    expect(winRateForMode(defaultStats, "read-my-mind")).toBe(0);
    expect(systemGuessAccuracy(defaultStats)).toBe(0);
    expect(playerGuessAccuracy(defaultStats)).toBe(0);
  });

  it("computes averages and rates correctly with non-zero data", () => {
    const rmmSystemWin: GameResult = {
      id: "a",
      mode: "read-my-mind",
      category: "animals",
      difficulty: "easy",
      winner: "system",
      title: "",
      message: "",
      playedAt: "2024-01-01T00:00:00.000Z",
      questionsUsed: 10,
      guessesUsed: 1,
      teachable: false,
    };
    const rmmPlayerWin: GameResult = { ...rmmSystemWin, id: "b", winner: "player" };

    let s = defaultStats;
    s = applyResultToStats(s, rmmSystemWin);
    s = applyResultToStats(s, rmmPlayerWin);

    expect(averageQuestionsForMode(s, "read-my-mind")).toBe(10);
    expect(winRateForMode(s, "read-my-mind")).toBeCloseTo(0.5, 5);
    expect(systemGuessAccuracy(s)).toBeCloseTo(0.5, 5); // 1 hit / 2 attempts
  });
});
