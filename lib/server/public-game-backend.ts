import { entityById } from "@/lib/data/entities";
import { difficultyConfig } from "@/lib/game/game-config";
import { normalizeDisplayName, validateDisplayName } from "@/lib/game/player-profile";
import { calculateGameScore } from "@/lib/game/score";
import {
  difficulties,
  entityCategories,
  gameModes,
  normalizedAnswers,
  type AnsweredQuestion,
  type GameMode,
  type GameResult,
  type LeaderboardEntry,
  type LeaderboardSnapshot,
  type PlayerProfile,
} from "@/types/game";

interface PublicGameBackendMemory {
  profiles: Map<string, PlayerProfile>;
  leaderboard: Map<string, LeaderboardEntry>;
  submissions: Set<string>;
  rateLimits: Map<string, { count: number; resetAt: number }>;
  suspiciousEvents: Array<{
    at: string;
    reason: string;
    playerId?: string;
    resultId?: string;
  }>;
}

interface BackendDiagnostics {
  profiles: number;
  leaderboardRows: number;
  acceptedSubmissions: number;
  activeRateLimitBuckets: number;
  suspiciousEvents: number;
  storage: string;
  durableConfigured: boolean;
}

export interface ScoreVerificationProof {
  answers?: AnsweredQuestion[];
  startedAt?: string;
}

export interface LeaderboardRepository {
  readonly storageMode: string;
  readonly durable: boolean;
  upsertProfile(profile: PlayerProfile): Promise<PlayerProfile>;
  submitScore(
    profile: PlayerProfile,
    result: GameResult,
    bestStreak: number,
  ): Promise<"accepted" | "duplicate">;
  getLeaderboardSnapshot(mode: GameMode): Promise<LeaderboardSnapshot>;
  diagnostics(): Promise<Omit<BackendDiagnostics, "activeRateLimitBuckets" | "suspiciousEvents">>;
}

declare global {
  var __mindReaderPublicBackend: PublicGameBackendMemory | undefined;
}

const SCORE_RATE_LIMIT = 30;
const PLAYER_SCORE_RATE_LIMIT = 14;
const PROFILE_RATE_LIMIT = 20;
const PLAYER_PROFILE_RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const MAX_FUTURE_SKEW_MS = 5 * 60_000;
const MIN_ROUND_DURATION_MS = 1_200;

function getMemory(): PublicGameBackendMemory {
  globalThis.__mindReaderPublicBackend ??= {
    profiles: new Map(),
    leaderboard: new Map(),
    submissions: new Set(),
    rateLimits: new Map(),
    suspiciousEvents: [],
  };

  return globalThis.__mindReaderPublicBackend;
}

function modeAggregateKey(playerId: string, mode: GameMode) {
  return `${playerId}:${mode}`;
}

function isAllowed<T extends string>(allowed: readonly T[], value: unknown): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function submissionKey(playerId: string, resultId: string) {
  return `${playerId}:${resultId}`;
}

function pushSuspiciousEvent(reason: string, playerId?: string, resultId?: string) {
  const memory = getMemory();
  memory.suspiciousEvents.unshift({
    at: new Date().toISOString(),
    reason,
    playerId,
    resultId,
  });
  memory.suspiciousEvents = memory.suspiciousEvents.slice(0, 100);
}

function parseDate(value: unknown, label: string) {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${label}.`);
  }

  const time = Date.parse(value);
  if (!Number.isFinite(time)) {
    throw new Error(`Invalid ${label}.`);
  }

  return time;
}

function assertIntegerInRange(
  value: unknown,
  min: number,
  max: number,
  label: string,
) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(`Invalid ${label}.`);
  }
}

function sanitizeAnswers(value: unknown, maxQuestions: number): AnsweredQuestion[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.length > maxQuestions) {
    throw new Error("Invalid answer trail.");
  }

  return value.map((entry, index) => {
    const answer = entry as Partial<AnsweredQuestion>;
    if (
      typeof answer.questionId !== "string" ||
      typeof answer.attributeKey !== "string" ||
      typeof answer.prompt !== "string" ||
      typeof answer.askedAt !== "string" ||
      !isAllowed(normalizedAnswers, answer.answer)
    ) {
      throw new Error(`Invalid answer trail item ${index + 1}.`);
    }

    parseDate(answer.askedAt, "answer timestamp");

    return {
      questionId: answer.questionId,
      attributeKey: answer.attributeKey as AnsweredQuestion["attributeKey"],
      prompt: answer.prompt,
      answer: answer.answer,
      askedAt: answer.askedAt,
    };
  });
}

function validateResultShape(
  result: Partial<GameResult>,
  proof: ScoreVerificationProof | undefined,
) {
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

  const config =
    result.mode === "read-my-mind"
      ? difficultyConfig[result.difficulty].readMyMind
      : difficultyConfig[result.difficulty].guessMyMind;
  const cap = result.mode === "read-my-mind" ? 480 : 500;
  assertIntegerInRange(result.questionsUsed, 0, config.maxQuestions, "question count");
  assertIntegerInRange(result.guessesUsed, 0, config.maxGuesses, "guess count");
  assertIntegerInRange(result.score, 0, cap, "score");

  if (!result.scoreBreakdown || result.scoreBreakdown.total !== result.score) {
    throw new Error("Invalid score breakdown.");
  }

  const playedAt = parseDate(result.playedAt, "playedAt timestamp");
  if (playedAt > Date.now() + MAX_FUTURE_SKEW_MS) {
    throw new Error("Result timestamp is too far in the future.");
  }

  if (proof?.startedAt) {
    const startedAt = parseDate(proof.startedAt, "startedAt timestamp");
    if (playedAt < startedAt) {
      throw new Error("Result timestamp predates the round start.");
    }

    if ((result.questionsUsed ?? 0) > 0 && playedAt - startedAt < MIN_ROUND_DURATION_MS) {
      throw new Error("Round duration is too short for the submitted score.");
    }
  }

  if (result.revealedEntityId && typeof result.revealedEntityId !== "string") {
    throw new Error("Invalid revealed entity id.");
  }
}

export function verifySubmittedScore(
  result: GameResult,
  proof?: ScoreVerificationProof,
) {
  validateResultShape(result, proof);

  const config =
    result.mode === "read-my-mind"
      ? difficultyConfig[result.difficulty].readMyMind
      : difficultyConfig[result.difficulty].guessMyMind;
  const answers = sanitizeAnswers(proof?.answers, config.maxQuestions);

  if (answers && answers.length !== result.questionsUsed) {
    throw new Error("Answer trail does not match question count.");
  }

  const revealedEntity = result.revealedEntityId
    ? entityById.get(result.revealedEntityId) ?? null
    : null;
  if (revealedEntity && revealedEntity.category !== result.category) {
    throw new Error("Revealed entity does not match result category.");
  }

  if (!revealedEntity && (result.scoreBreakdown.rarityBonus ?? 0) > 0) {
    throw new Error("Unknown revealed entity cannot claim a rarity bonus.");
  }

  const recomputed = calculateGameScore({
    mode: result.mode,
    difficulty: result.difficulty,
    winner: result.winner,
    questionsUsed: result.questionsUsed,
    guessesUsed: result.guessesUsed,
    answers,
    entity: revealedEntity,
  });

  const expectedBreakdown = JSON.stringify(recomputed);
  const submittedBreakdown = JSON.stringify(result.scoreBreakdown);

  if (recomputed.total !== result.score || expectedBreakdown !== submittedBreakdown) {
    pushSuspiciousEvent("score_mismatch", undefined, result.id);
    throw new Error("Score verification failed.");
  }

  return recomputed;
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
  const memory = getMemory();
  const now = Date.now();
  const current = memory.rateLimits.get(bucket);

  if (!current || current.resetAt <= now) {
    memory.rateLimits.set(bucket, { count: 1, resetAt: now + windowMs });
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

class MemoryLeaderboardRepository implements LeaderboardRepository {
  readonly storageMode = "server-memory";
  readonly durable = false;

  async upsertProfile(profile: PlayerProfile) {
    getMemory().profiles.set(profile.id, profile);
    return profile;
  }

  async submitScore(profile: PlayerProfile, result: GameResult, bestStreak: number) {
    const memory = getMemory();
    const key = submissionKey(profile.id, result.id);
    if (memory.submissions.has(key)) {
      pushSuspiciousEvent("duplicate_submission", profile.id, result.id);
      return "duplicate" as const;
    }

    memory.submissions.add(key);
    await this.upsertProfile(profile);

    const aggregateKey = modeAggregateKey(profile.id, result.mode);
    const existing = memory.leaderboard.get(aggregateKey);
    const gamesPlayed = (existing?.gamesPlayed ?? 0) + 1;
    const totalScore = (existing?.totalScore ?? 0) + result.score;
    const wins = (existing?.wins ?? 0) + (result.winner === "player" ? 1 : 0);

    memory.leaderboard.set(aggregateKey, {
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

    return "accepted" as const;
  }

  async getLeaderboardSnapshot(mode: GameMode): Promise<LeaderboardSnapshot> {
    const entries = [...getMemory().leaderboard.values()]
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

  async diagnostics() {
    const memory = getMemory();
    return {
      profiles: memory.profiles.size,
      leaderboardRows: memory.leaderboard.size,
      acceptedSubmissions: memory.submissions.size,
      storage: this.storageMode,
      durableConfigured: this.durable,
    };
  }
}

class UpstashRedisLeaderboardRepository implements LeaderboardRepository {
  readonly storageMode = "upstash-redis";
  readonly durable = true;

  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly prefix = process.env.MIND_READER_REDIS_PREFIX || "mind-reader",
  ) {}

  private key(name: string) {
    return `${this.prefix}:${name}`;
  }

  private async command<T>(command: unknown[]): Promise<T> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    const body = (await response.json()) as { result?: T; error?: string };

    if (!response.ok || body.error) {
      throw new Error(body.error ?? `Redis command failed with ${response.status}`);
    }

    return body.result as T;
  }

  private profileKey(playerId: string) {
    return this.key(`profile:${playerId}`);
  }

  private aggregateKey(playerId: string, mode: GameMode) {
    return this.key(`leaderboard:${mode}:${playerId}`);
  }

  private submissionKey(playerId: string, resultId: string) {
    return this.key(`submission:${playerId}:${resultId}`);
  }

  async upsertProfile(profile: PlayerProfile) {
    await this.command(["SET", this.profileKey(profile.id), JSON.stringify(profile)]);
    await this.command(["SADD", this.key("profiles"), profile.id]);
    return profile;
  }

  async submitScore(profile: PlayerProfile, result: GameResult, bestStreak: number) {
    const accepted = await this.command<string | null>([
      "SET",
      this.submissionKey(profile.id, result.id),
      JSON.stringify({
        playerId: profile.id,
        resultId: result.id,
        mode: result.mode,
        category: result.category,
        difficulty: result.difficulty,
        score: result.score,
        questionsUsed: result.questionsUsed,
        guessesUsed: result.guessesUsed,
        winner: result.winner,
        playedAt: result.playedAt,
        submittedAt: new Date().toISOString(),
      }),
      "NX",
    ]);

    if (accepted !== "OK") {
      pushSuspiciousEvent("duplicate_submission", profile.id, result.id);
      return "duplicate" as const;
    }

    await this.command(["SADD", this.key("submissions"), submissionKey(profile.id, result.id)]);
    await this.upsertProfile(profile);

    const aggregateKey = this.aggregateKey(profile.id, result.mode);
    const existingRaw = await this.command<string | null>(["GET", aggregateKey]);
    const existing = existingRaw ? (JSON.parse(existingRaw) as LeaderboardEntry) : null;
    const gamesPlayed = (existing?.gamesPlayed ?? 0) + 1;
    const totalScore = (existing?.totalScore ?? 0) + result.score;
    const wins = (existing?.wins ?? 0) + (result.winner === "player" ? 1 : 0);
    const entry: LeaderboardEntry = {
      playerId: profile.id,
      displayName: profile.displayName,
      mode: result.mode,
      totalScore,
      gamesPlayed,
      wins,
      bestStreak: Math.max(existing?.bestStreak ?? 0, Math.max(0, bestStreak)),
      averageScore: totalScore / gamesPlayed,
      updatedAt: new Date().toISOString(),
    };

    await this.command(["SET", aggregateKey, JSON.stringify(entry)]);
    await this.command([
      "ZADD",
      this.key(`leaderboard-index:${result.mode}`),
      totalScore,
      profile.id,
    ]);

    return "accepted" as const;
  }

  async getLeaderboardSnapshot(mode: GameMode): Promise<LeaderboardSnapshot> {
    const playerIds = await this.command<string[]>([
      "ZREVRANGE",
      this.key(`leaderboard-index:${mode}`),
      0,
      49,
    ]);
    const aggregateKeys = playerIds.map((playerId) => this.aggregateKey(playerId, mode));
    const rows =
      aggregateKeys.length > 0
        ? await this.command<Array<string | null>>(["MGET", ...aggregateKeys])
        : [];
    const entries = rows
      .map((row) => (row ? (JSON.parse(row) as LeaderboardEntry) : null))
      .filter((entry): entry is LeaderboardEntry => entry !== null)
      .toSorted((left, right) => {
        if (right.totalScore !== left.totalScore) {
          return right.totalScore - left.totalScore;
        }

        if (right.wins !== left.wins) {
          return right.wins - left.wins;
        }

        return left.displayName.localeCompare(right.displayName);
      });

    return {
      mode,
      entries,
      generatedAt: new Date().toISOString(),
      source: "remote",
    };
  }

  async diagnostics() {
    const [profiles, leaderboardRows, acceptedSubmissions] = await Promise.all([
      this.command<number>(["SCARD", this.key("profiles")]),
      this.command<number>(["ZCARD", this.key("leaderboard-index:read-my-mind")]).then(
        async (readCount) =>
          readCount +
          (await this.command<number>(["ZCARD", this.key("leaderboard-index:guess-my-mind")])),
      ),
      this.command<number>(["SCARD", this.key("submissions")]),
    ]);

    return {
      profiles,
      leaderboardRows,
      acceptedSubmissions,
      storage: this.storageMode,
      durableConfigured: this.durable,
    };
  }
}

let repository: LeaderboardRepository | null = null;

export function getLeaderboardRepository() {
  if (repository) {
    return repository;
  }

  const redisUrl =
    process.env.MIND_READER_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken =
    process.env.MIND_READER_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken && process.env.MIND_READER_LEADERBOARD_STORAGE !== "memory") {
    repository = new UpstashRedisLeaderboardRepository(redisUrl, redisToken);
  } else {
    repository = new MemoryLeaderboardRepository();
  }

  return repository;
}

export async function upsertPlayerProfile(profile: PlayerProfile) {
  return getLeaderboardRepository().upsertProfile(profile);
}

export async function submitScore(
  profile: PlayerProfile,
  result: GameResult,
  bestStreak: number,
  proof?: ScoreVerificationProof,
) {
  verifySubmittedScore(result, proof);
  const outcome = await getLeaderboardRepository().submitScore(profile, result, bestStreak);
  if (outcome === "duplicate") {
    throw new Error("Duplicate score submission.");
  }
}

export async function getLeaderboardSnapshot(mode: GameMode): Promise<LeaderboardSnapshot> {
  return getLeaderboardRepository().getLeaderboardSnapshot(mode);
}

export async function getPublicBackendDiagnostics(): Promise<BackendDiagnostics> {
  const repositoryDiagnostics = await getLeaderboardRepository().diagnostics();
  const memory = getMemory();

  return {
    ...repositoryDiagnostics,
    activeRateLimitBuckets: memory.rateLimits.size,
    suspiciousEvents: memory.suspiciousEvents.length,
  };
}

export const publicBackendLimits = {
  profile: PROFILE_RATE_LIMIT,
  profilePerPlayer: PLAYER_PROFILE_RATE_LIMIT,
  score: SCORE_RATE_LIMIT,
  scorePerPlayer: PLAYER_SCORE_RATE_LIMIT,
  windowMs: WINDOW_MS,
};
