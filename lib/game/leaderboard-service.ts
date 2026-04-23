import type {
  GameMode,
  GameResult,
  LeaderboardEntry,
  LeaderboardSnapshot,
  PlayerProfile,
} from "@/types/game";

const LOCAL_LEADERBOARD_KEY = "mind-reader.leaderboard.v1";
const REFRESH_MS = 12_000;

interface LeaderboardStore {
  entries: LeaderboardEntry[];
}

export interface PublicGameServices {
  source: "local" | "remote";
  refreshIntervalMs: number;
  submitResult(profile: PlayerProfile, result: GameResult, bestStreak: number): Promise<void>;
  getLeaderboard(mode: GameMode): Promise<LeaderboardSnapshot>;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readLocalStore(): LeaderboardStore {
  if (!canUseStorage()) {
    return { entries: [] };
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (!raw) {
      return { entries: [] };
    }
    const parsed = JSON.parse(raw) as Partial<LeaderboardStore>;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

function writeLocalStore(store: LeaderboardStore) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(store));
}

function rank(entries: LeaderboardEntry[]) {
  return entries.toSorted((left, right) => {
    if (right.totalScore !== left.totalScore) {
      return right.totalScore - left.totalScore;
    }

    if (right.wins !== left.wins) {
      return right.wins - left.wins;
    }

    return left.displayName.localeCompare(right.displayName);
  });
}

class LocalLeaderboardService implements PublicGameServices {
  source = "local" as const;
  refreshIntervalMs = REFRESH_MS;

  async submitResult(profile: PlayerProfile, result: GameResult, bestStreak: number) {
    const store = readLocalStore();
    const existing = store.entries.find(
      (entry) => entry.playerId === profile.id && entry.mode === result.mode,
    );
    const gamesPlayed = (existing?.gamesPlayed ?? 0) + 1;
    const totalScore = (existing?.totalScore ?? 0) + result.score;
    const wins = (existing?.wins ?? 0) + (result.winner === "player" ? 1 : 0);
    const next: LeaderboardEntry = {
      playerId: profile.id,
      displayName: profile.displayName,
      mode: result.mode,
      totalScore,
      gamesPlayed,
      wins,
      bestStreak: Math.max(existing?.bestStreak ?? 0, bestStreak),
      averageScore: totalScore / gamesPlayed,
      updatedAt: new Date().toISOString(),
    };

    writeLocalStore({
      entries: [
        ...store.entries.filter(
          (entry) => !(entry.playerId === profile.id && entry.mode === result.mode),
        ),
        next,
      ],
    });
  }

  async getLeaderboard(mode: GameMode): Promise<LeaderboardSnapshot> {
    return {
      mode,
      entries: rank(readLocalStore().entries.filter((entry) => entry.mode === mode)).slice(0, 50),
      generatedAt: new Date().toISOString(),
      source: "local",
    };
  }
}

class RemoteLeaderboardService implements PublicGameServices {
  source = "remote" as const;
  refreshIntervalMs = REFRESH_MS;

  constructor(private readonly baseUrl: string) {}

  async submitResult(profile: PlayerProfile, result: GameResult, bestStreak: number) {
    await fetch(`${this.baseUrl}/scores`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile, result, bestStreak }),
    });
  }

  async getLeaderboard(mode: GameMode): Promise<LeaderboardSnapshot> {
    const response = await fetch(`${this.baseUrl}/leaderboard?mode=${encodeURIComponent(mode)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Leaderboard request failed: ${response.status}`);
    }

    return response.json() as Promise<LeaderboardSnapshot>;
  }
}

export function createPublicGameServices(): PublicGameServices {
  const baseUrl = process.env.NEXT_PUBLIC_MIND_READER_BACKEND_URL?.replace(/\/$/, "");
  if (baseUrl) {
    return new RemoteLeaderboardService(baseUrl);
  }

  return new LocalLeaderboardService();
}
