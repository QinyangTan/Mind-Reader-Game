import type { GameMode, GameResult, LeaderboardEntry, LeaderboardSnapshot, PlayerProfile } from "@/types/game";

interface ServerLeaderboardStore {
  players: Map<string, PlayerProfile>;
  entries: Map<string, LeaderboardEntry>;
  submissionsByPlayer: Map<string, number[]>;
}

const RATE_WINDOW_MS = 60_000;
const MAX_SUBMISSIONS_PER_WINDOW = 24;

type GlobalWithStore = typeof globalThis & {
  __mindReaderLeaderboardStore?: ServerLeaderboardStore;
};

function getGlobalStore(): ServerLeaderboardStore {
  const globalStore = globalThis as GlobalWithStore;

  if (!globalStore.__mindReaderLeaderboardStore) {
    globalStore.__mindReaderLeaderboardStore = {
      players: new Map(),
      entries: new Map(),
      submissionsByPlayer: new Map(),
    };
  }

  return globalStore.__mindReaderLeaderboardStore;
}

function sanitizeDisplayName(displayName: string) {
  return displayName.replace(/[^a-zA-Z0-9 ._-]/g, "").replace(/\s+/g, " ").trim().slice(0, 18);
}

export function normalizeProfile(profile: PlayerProfile): PlayerProfile {
  const displayName = sanitizeDisplayName(profile.displayName);

  if (!profile.id || displayName.length < 2) {
    throw new Error("Invalid player profile");
  }

  const now = new Date().toISOString();

  return {
    version: 1,
    id: profile.id.slice(0, 96),
    displayName,
    createdAt: profile.createdAt || now,
    updatedAt: now,
  };
}

export function upsertPlayer(profile: PlayerProfile) {
  const store = getGlobalStore();
  const normalized = normalizeProfile(profile);
  store.players.set(normalized.id, normalized);
  return normalized;
}

function validateMode(mode: unknown): asserts mode is GameMode {
  if (mode !== "read-my-mind" && mode !== "guess-my-mind") {
    throw new Error("Invalid game mode");
  }
}

function validateScore(result: GameResult) {
  validateMode(result.mode);

  if (!Number.isFinite(result.score) || result.score < 0) {
    throw new Error("Invalid score");
  }

  const cap = result.mode === "read-my-mind" ? 480 : 500;
  if (result.score > cap) {
    throw new Error("Score exceeds mode cap");
  }

  if (result.questionsUsed < 0 || result.questionsUsed > 60 || result.guessesUsed < 0 || result.guessesUsed > 20) {
    throw new Error("Invalid session counters");
  }
}

function assertRateLimit(playerId: string) {
  const store = getGlobalStore();
  const now = Date.now();
  const recent = (store.submissionsByPlayer.get(playerId) ?? []).filter((time) => now - time < RATE_WINDOW_MS);

  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    throw new Error("Rate limit exceeded");
  }

  store.submissionsByPlayer.set(playerId, [...recent, now]);
}

function entryKey(playerId: string, mode: GameMode) {
  return `${playerId}:${mode}`;
}

export function submitLeaderboardScore(profile: PlayerProfile, result: GameResult, bestStreak: number) {
  const store = getGlobalStore();
  const normalized = upsertPlayer(profile);
  validateScore(result);
  assertRateLimit(normalized.id);

  const key = entryKey(normalized.id, result.mode);
  const existing = store.entries.get(key);
  const gamesPlayed = (existing?.gamesPlayed ?? 0) + 1;
  const totalScore = (existing?.totalScore ?? 0) + result.score;
  const wins = (existing?.wins ?? 0) + (result.winner === "player" ? 1 : 0);

  const next: LeaderboardEntry = {
    playerId: normalized.id,
    displayName: normalized.displayName,
    mode: result.mode,
    totalScore,
    gamesPlayed,
    wins,
    bestStreak: Math.max(existing?.bestStreak ?? 0, bestStreak),
    averageScore: totalScore / gamesPlayed,
    updatedAt: new Date().toISOString(),
  };

  store.entries.set(key, next);
  return next;
}

export function getLeaderboardSnapshot(mode: GameMode): LeaderboardSnapshot {
  validateMode(mode);
  const store = getGlobalStore();
  const entries = [...store.entries.values()]
    .filter((entry) => entry.mode === mode)
    .toSorted((left, right) => {
      if (right.totalScore !== left.totalScore) {
        return right.totalScore - left.totalScore;
      }

      if (right.wins !== left.wins) {
        return right.wins - left.wins;
      }

      return left.displayName.localeCompare(right.displayName);
    })
    .slice(0, 50);

  return {
    mode,
    entries,
    generatedAt: new Date().toISOString(),
    source: "remote",
  };
}
