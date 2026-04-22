import {
  loadLearnedEntities,
  mergeLegacyTeachCases,
  saveLearnedEntities,
} from "@/lib/game/learned-storage";
import type {
  Difficulty,
  EntityCategory,
  GameMode,
  GameResult,
  GameStats,
  HistoryEntry,
  LegacyPersistedVaultV1,
  PersistedVault,
  StoredSettings,
} from "@/types/game";
import { difficulties, entityCategories, gameModes } from "@/types/game";

const STORAGE_KEY = "mind-reader.v1";
const CURRENT_VAULT_VERSION = 2 as const;

export const defaultSettings: StoredSettings = {
  mode: "read-my-mind",
  category: "fictional_characters",
  difficulty: "normal",
  soundEnabled: true,
  useTeachCases: true,
};

function zeroRecord<T extends readonly string[]>(values: T): Record<T[number], number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<T[number], number>;
}

export const defaultStats: GameStats = {
  totalGames: 0,
  systemWins: 0,
  playerWins: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastMode: null,
  lastCategory: null,
  lastPlayedAt: null,
  byMode: zeroRecord(gameModes),
  byCategory: zeroRecord(entityCategories),
  winsByMode: zeroRecord(gameModes),
  winsByCategory: zeroRecord(entityCategories),
  byDifficulty: zeroRecord(difficulties),
  winsByDifficulty: zeroRecord(difficulties),
  questionsByMode: zeroRecord(gameModes),
  systemGuessAttempts: 0,
  systemGuessHits: 0,
  playerGuessAttempts: 0,
  playerGuessHits: 0,
};

export const defaultVault: PersistedVault = {
  version: CURRENT_VAULT_VERSION,
  settings: defaultSettings,
  stats: defaultStats,
  history: [],
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function mergeStats(raw: Partial<GameStats> | undefined): GameStats {
  return {
    ...defaultStats,
    ...raw,
    byMode: { ...defaultStats.byMode, ...raw?.byMode },
    byCategory: { ...defaultStats.byCategory, ...raw?.byCategory },
    winsByMode: { ...defaultStats.winsByMode, ...raw?.winsByMode },
    winsByCategory: { ...defaultStats.winsByCategory, ...raw?.winsByCategory },
    byDifficulty: { ...defaultStats.byDifficulty, ...raw?.byDifficulty },
    winsByDifficulty: { ...defaultStats.winsByDifficulty, ...raw?.winsByDifficulty },
    questionsByMode: { ...defaultStats.questionsByMode, ...raw?.questionsByMode },
  };
}

function normalizeVaultShape(
  parsed: Partial<PersistedVault> & Partial<LegacyPersistedVaultV1>,
): PersistedVault {
  return {
    version: CURRENT_VAULT_VERSION,
    settings: {
      ...defaultSettings,
      ...parsed.settings,
    },
    stats: mergeStats(parsed.stats),
    history: Array.isArray(parsed.history) ? parsed.history : [],
  };
}

/**
 * Loads the vault from localStorage.
 *
 * Migration v1 -> v2: if the stored payload still has inline `teachCases`,
 * those entries are moved into the separate learned-entity store and the
 * vault is rewritten without them. Safe to run multiple times: legacy cases
 * are merged by id, and once the vault is at v2 no further migration runs.
 */
export function loadVault(): PersistedVault {
  if (!canUseStorage()) {
    return defaultVault;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultVault;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedVault> &
      Partial<LegacyPersistedVaultV1>;

    const normalized = normalizeVaultShape(parsed);
    const needsMigration =
      parsed.version !== CURRENT_VAULT_VERSION || Array.isArray(parsed.teachCases);

    if (needsMigration) {
      const legacyTeachCases = Array.isArray(parsed.teachCases) ? parsed.teachCases : [];

      if (legacyTeachCases.length > 0) {
        const currentLearned = loadLearnedEntities();
        const migrated = mergeLegacyTeachCases(currentLearned, legacyTeachCases);
        saveLearnedEntities(migrated);
      }

      saveVault(normalized);
    }

    return normalized;
  } catch {
    return defaultVault;
  }
}

export function saveVault(vault: PersistedVault) {
  if (!canUseStorage()) {
    return;
  }

  const serializable: PersistedVault = {
    version: CURRENT_VAULT_VERSION,
    settings: vault.settings,
    stats: vault.stats,
    history: vault.history,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

export function applyResultToStats(stats: GameStats, result: GameResult): GameStats {
  const systemWon = result.winner === "system";
  const playerWon = !systemWon;
  const currentStreak = systemWon ? 0 : stats.currentStreak + 1;
  const playerWinInc = playerWon ? 1 : 0;

  // Guess counters are mode-specific: the chamber makes guesses in Read My
  // Mind (system hit = system won that round), and the player makes guesses
  // in Guess My Mind (player hit = player won that round). Each game
  // contributes exactly its `guessesUsed` attempts and at most one hit.
  const systemGuessAttemptsInc =
    result.mode === "read-my-mind" ? result.guessesUsed : 0;
  const systemGuessHitsInc =
    result.mode === "read-my-mind" && systemWon ? 1 : 0;
  const playerGuessAttemptsInc =
    result.mode === "guess-my-mind" ? result.guessesUsed : 0;
  const playerGuessHitsInc =
    result.mode === "guess-my-mind" && playerWon ? 1 : 0;

  return {
    ...stats,
    totalGames: stats.totalGames + 1,
    systemWins: stats.systemWins + (systemWon ? 1 : 0),
    playerWins: stats.playerWins + playerWinInc,
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
    winsByMode: {
      ...stats.winsByMode,
      [result.mode]: stats.winsByMode[result.mode] + playerWinInc,
    },
    winsByCategory: {
      ...stats.winsByCategory,
      [result.category]: stats.winsByCategory[result.category] + playerWinInc,
    },
    byDifficulty: {
      ...stats.byDifficulty,
      [result.difficulty]: stats.byDifficulty[result.difficulty] + 1,
    },
    winsByDifficulty: {
      ...stats.winsByDifficulty,
      [result.difficulty]: stats.winsByDifficulty[result.difficulty] + playerWinInc,
    },
    questionsByMode: {
      ...stats.questionsByMode,
      [result.mode]: stats.questionsByMode[result.mode] + result.questionsUsed,
    },
    systemGuessAttempts: stats.systemGuessAttempts + systemGuessAttemptsInc,
    systemGuessHits: stats.systemGuessHits + systemGuessHitsInc,
    playerGuessAttempts: stats.playerGuessAttempts + playerGuessAttemptsInc,
    playerGuessHits: stats.playerGuessHits + playerGuessHitsInc,
  };
}

/**
 * Derived lifetime metrics. All return 0 when the denominator is 0 so the
 * UI can render "—" for "no data yet" without divide-by-zero guards.
 */
export function averageQuestionsForMode(stats: GameStats, mode: GameMode) {
  const games = stats.byMode[mode];
  if (games === 0) {
    return 0;
  }
  return stats.questionsByMode[mode] / games;
}

export function winRateForMode(stats: GameStats, mode: GameMode) {
  const games = stats.byMode[mode];
  if (games === 0) {
    return 0;
  }
  return stats.winsByMode[mode] / games;
}

export function winRateForCategory(stats: GameStats, category: EntityCategory) {
  const games = stats.byCategory[category];
  if (games === 0) {
    return 0;
  }
  return stats.winsByCategory[category] / games;
}

export function winRateForDifficulty(stats: GameStats, difficulty: Difficulty) {
  const games = stats.byDifficulty[difficulty];
  if (games === 0) {
    return 0;
  }
  return stats.winsByDifficulty[difficulty] / games;
}

export function systemGuessAccuracy(stats: GameStats) {
  if (stats.systemGuessAttempts === 0) {
    return 0;
  }
  return stats.systemGuessHits / stats.systemGuessAttempts;
}

export function playerGuessAccuracy(stats: GameStats) {
  if (stats.playerGuessAttempts === 0) {
    return 0;
  }
  return stats.playerGuessHits / stats.playerGuessAttempts;
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
    ...(result.strongestQuestion ? { strongestQuestion: result.strongestQuestion } : {}),
  };
}
