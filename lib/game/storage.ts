import type {
  GameResult,
  GameStats,
  HistoryEntry,
  PersistedVault,
  StoredSettings,
} from "@/types/game";

const STORAGE_KEY = "mind-reader.v1";

export const defaultSettings: StoredSettings = {
  mode: "read-my-mind",
  category: "fictional_characters",
  difficulty: "normal",
  soundEnabled: true,
};

export const defaultStats: GameStats = {
  totalGames: 0,
  systemWins: 0,
  playerWins: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastMode: null,
  lastCategory: null,
  lastPlayedAt: null,
  byMode: {
    "read-my-mind": 0,
    "guess-my-mind": 0,
  },
  byCategory: {
    fictional_characters: 0,
    animals: 0,
  },
};

export const defaultVault: PersistedVault = {
  version: 1,
  settings: defaultSettings,
  stats: defaultStats,
  history: [],
  teachCases: [],
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadVault(): PersistedVault {
  if (!canUseStorage()) {
    return defaultVault;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultVault;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedVault>;

    return {
      version: 1,
      settings: {
        ...defaultSettings,
        ...parsed.settings,
      },
      stats: {
        ...defaultStats,
        ...parsed.stats,
        byMode: {
          ...defaultStats.byMode,
          ...parsed.stats?.byMode,
        },
        byCategory: {
          ...defaultStats.byCategory,
          ...parsed.stats?.byCategory,
        },
      },
      history: parsed.history ?? [],
      teachCases: parsed.teachCases ?? [],
    };
  } catch {
    return defaultVault;
  }
}

export function saveVault(vault: PersistedVault) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
}

export function applyResultToStats(stats: GameStats, result: GameResult): GameStats {
  const systemWon = result.winner === "system";
  const currentStreak = systemWon ? 0 : stats.currentStreak + 1;

  return {
    ...stats,
    totalGames: stats.totalGames + 1,
    systemWins: stats.systemWins + (systemWon ? 1 : 0),
    playerWins: stats.playerWins + (systemWon ? 0 : 1),
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    lastMode: result.mode,
    lastCategory: result.category,
    lastPlayedAt: result.playedAt,
    byMode: {
      ...stats.byMode,
      [result.mode]: stats.byMode[result.mode] + 1,
    },
    byCategory: {
      ...stats.byCategory,
      [result.category]: stats.byCategory[result.category] + 1,
    },
  };
}

export function createHistoryEntry(result: GameResult): HistoryEntry {
  return {
    id: result.id,
    playedAt: result.playedAt,
    mode: result.mode,
    category: result.category,
    difficulty: result.difficulty,
    winner: result.winner,
    title: result.title,
    questionsUsed: result.questionsUsed,
    guessesUsed: result.guessesUsed,
    revealedEntityName: result.revealedEntityName,
  };
}
