import { difficultyConfig } from "@/lib/game/game-config";
import { normalizeDisplayName, validateDisplayName } from "@/lib/game/player-profile";
import {
  difficulties,
  entityCategories,
  gameModes,
  type GameMode,
  type GameResult,
  type LeaderboardEntry,
  type LeaderboardSnapshot,
  type PlayerProfile,
} from "@/types/game";

interface PublicGameBackendStore {
  profiles: Map<string, PlayerProfile>;
  leaderboard: Map<string, LeaderboardEntry>;
  submissions: Set<string>;
  rateLimits: Map<string, { count: number; resetAt: number }>;
}

declare global {
  // Preserves state across warm local/serverless invocations. Projects that
  // need durable public rankings can swap these route handlers to a KV/SQL
  // adapter without changing the client contract.
  var __mindReaderPublicBackend: PublicGameBackendStore | undefined;
}

const SCORE_RATE_LIMIT = 30;
const PROFILE_RATE_LIMIT = 20;
const WINDOW_MS = 60_000;

function getStore(): PublicGameBackendStore {
  globalThis.__mindReaderPublicBackend ??= {
    profiles: new Map(),
    leaderboard: new Map(),
    submissions: new Set(),
    rateLimits: new Map(),
  };

  return globalThis.__mindReaderPublicBackend;
}

function modeAggregateKey(playerId: string, mode: GameMode) {
  return `${playerId}:${mode}`;
}

function isAllowed<T extends string>(allowed: readonly T[], value: unknown): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

export function clientKeyFromRequest(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown-client"
  );
}

export function checkRateLimit(
  bucket: string,
  limit: number,
  windowMs = WINDOW_MS,
) {
  const store = getStore();
  const now = Date.now();
  const current = store.rateLimits.get(bucket);

  if (!current || current.resetAt <= now) {
    store.rateLimits.set(bucket, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}

export function sanitizeIncomingProfile(value: unknown): PlayerProfile {
  const profile = value as Partial<PlayerProfile>;
  const displayName = normalizeDisplayName(String(profile.displayName ?? ""));
  const nameError = validateDisplayName(displayName);

  if (!profile.id || typeof profile.id !== "string" || profile.id.length > 80) {
    throw new Error("Invalid player id.");
  }

  if (nameError) {
    throw new Error(nameError);
  }

  const now = new Date().toISOString();

  return {
    version: 1,
    id: profile.id,
    displayName,
    createdAt: typeof profile.createdAt === "string" ? profile.createdAt : now,
    updatedAt: now,
  };
}

function validateResult(result: Partial<GameResult>) {
  if (!result.id || typeof result.id !== "string" || result.id.length > 100) {
    throw new Error("Invalid result id.");
  }

  if (!isAllowed(gameModes, result.mode)) {
    throw new Error("Invalid game mode.");
  }

  if (!isAllowed(entityCategories, result.category)) {
    throw new Error("Invalid category.");
  }

  if (!isAllowed(difficulties, result.difficulty)) {
    throw new Error("Invalid difficulty.");
  }

  if (result.winner !== "player" && result.winner !== "system") {
    throw new Error("Invalid winner.");
  }

  const score = result.score;
  const questionsUsed = result.questionsUsed;
  const guessesUsed = result.guessesUsed;
  const config =
    result.mode === "read-my-mind"
      ? difficultyConfig[result.difficulty].readMyMind
      : difficultyConfig[result.difficulty].guessMyMind;
  const cap = result.mode === "read-my-mind" ? 480 : 500;

  if (
    typeof score !== "number" ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > cap ||
    result.scoreBreakdown?.total !== score
  ) {
    throw new Error("Invalid score.");
  }

  if (
    typeof questionsUsed !== "number" ||
    !Number.isFinite(questionsUsed) ||
    questionsUsed < 0 ||
    questionsUsed > config.maxQuestions
  ) {
    throw new Error("Invalid question count.");
  }

  if (
    typeof guessesUsed !== "number" ||
    !Number.isFinite(guessesUsed) ||
    guessesUsed < 0 ||
    guessesUsed > config.maxGuesses
  ) {
    throw new Error("Invalid guess count.");
  }
}

export function upsertPlayerProfile(profile: PlayerProfile) {
  const store = getStore();
  store.profiles.set(profile.id, profile);
  return profile;
}

export function submitScore(
  profile: PlayerProfile,
  result: GameResult,
  bestStreak: number,
) {
  validateResult(result);

  const store = getStore();
  const submissionKey = `${profile.id}:${result.id}`;
  if (store.submissions.has(submissionKey)) {
    return;
  }
  store.submissions.add(submissionKey);
  upsertPlayerProfile(profile);

  const aggregateKey = modeAggregateKey(profile.id, result.mode);
  const existing = store.leaderboard.get(aggregateKey);
  const gamesPlayed = (existing?.gamesPlayed ?? 0) + 1;
  const totalScore = (existing?.totalScore ?? 0) + result.score;
  const wins = (existing?.wins ?? 0) + (result.winner === "player" ? 1 : 0);

  store.leaderboard.set(aggregateKey, {
    playerId: profile.id,
    displayName: profile.displayName,
    mode: result.mode,
    totalScore,
    gamesPlayed,
    wins,
    bestStreak: Math.max(existing?.bestStreak ?? 0, Math.max(0, bestStreak)),
    averageScore: totalScore / gamesPlayed,
    updatedAt: new Date().toISOString(),
  });
}

export function getLeaderboardSnapshot(mode: GameMode): LeaderboardSnapshot {
  const store = getStore();
  const entries = [...store.leaderboard.values()]
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

export function getPublicBackendDiagnostics() {
  const store = getStore();

  return {
    profiles: store.profiles.size,
    leaderboardRows: store.leaderboard.size,
    acceptedSubmissions: store.submissions.size,
    activeRateLimitBuckets: store.rateLimits.size,
    storage: "server-memory",
  };
}

export const publicBackendLimits = {
  profile: PROFILE_RATE_LIMIT,
  score: SCORE_RATE_LIMIT,
};
