import {
  attributeKeys,
  normalizedAnswers,
  type AttributeKey,
  type LegacyLearnedEntityStoreV1,
  type LearnedEntityStore,
  type LearnedInferenceModel,
  type NormalizedAnswer,
  type TeachCase,
} from "@/types/game";
import { defaultLearnedInferenceModel } from "@/lib/game/inference-model";

const attributeKeySet = new Set<string>(attributeKeys);
const normalizedAnswerSet = new Set<string>(normalizedAnswers);

const LEARNED_STORAGE_KEY = "mind-reader.learned.v1";
const MAX_LEARNED_ENTRIES = 64;

export const defaultLearnedStore: LearnedEntityStore = {
  version: 2,
  entries: [],
  model: defaultLearnedInferenceModel,
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sanitizeExtraAttributes(
  raw: unknown,
): Partial<Record<AttributeKey, NormalizedAnswer>> | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const cleaned: Partial<Record<AttributeKey, NormalizedAnswer>> = {};

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (
      attributeKeySet.has(key) &&
      typeof value === "string" &&
      normalizedAnswerSet.has(value)
    ) {
      cleaned[key as AttributeKey] = value as NormalizedAnswer;
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

function sanitizeEntries(entries: unknown): TeachCase[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .filter((entry): entry is Partial<TeachCase> => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      const candidate = entry as Partial<TeachCase>;

      return (
        typeof candidate.id === "string" &&
        typeof candidate.createdAt === "string" &&
        typeof candidate.entityName === "string" &&
        typeof candidate.note === "string" &&
        Array.isArray(candidate.answers)
      );
    })
    .map((entry) => {
      const rawExtra = (entry as { extraAttributes?: unknown }).extraAttributes;
      const extra = sanitizeExtraAttributes(rawExtra);
      const { extraAttributes, ...rest } = entry as TeachCase & {
        extraAttributes?: unknown;
      };
      void extraAttributes;

      return (extra ? { ...rest, extraAttributes: extra } : rest) as TeachCase;
    });
}

export function loadLearnedEntities(): LearnedEntityStore {
  if (!canUseStorage()) {
    return defaultLearnedStore;
  }

  try {
    const raw = window.localStorage.getItem(LEARNED_STORAGE_KEY);

    if (!raw) {
      return defaultLearnedStore;
    }

    const parsed = JSON.parse(raw) as Partial<LearnedEntityStore> &
      Partial<LegacyLearnedEntityStoreV1>;

    const migrated: LearnedEntityStore = {
      version: 2,
      entries: sanitizeEntries(parsed.entries).slice(0, MAX_LEARNED_ENTRIES),
      model: sanitizeModel((parsed as Partial<LearnedEntityStore>).model),
    };

    if (parsed.version !== 2) {
      saveLearnedEntities(migrated);
    }

    return migrated;
  } catch {
    return defaultLearnedStore;
  }
}

export function saveLearnedEntities(store: LearnedEntityStore) {
  if (!canUseStorage()) {
    return;
  }

  const capped: LearnedEntityStore = {
    version: 2,
    entries: store.entries.slice(0, MAX_LEARNED_ENTRIES),
    model: sanitizeModel(store.model),
  };

  window.localStorage.setItem(LEARNED_STORAGE_KEY, JSON.stringify(capped));
}

export function prependLearnedEntity(
  store: LearnedEntityStore,
  entry: TeachCase,
): LearnedEntityStore {
  return {
    version: 2,
    entries: [entry, ...store.entries].slice(0, MAX_LEARNED_ENTRIES),
    model: store.model,
  };
}

/**
 * Merges legacy teachCases from a v1 vault into the existing learned store
 * without duplicating ids. Safe to call multiple times.
 */
export function mergeLegacyTeachCases(
  store: LearnedEntityStore,
  legacy: TeachCase[],
): LearnedEntityStore {
  if (legacy.length === 0) {
    return store;
  }

  const existingIds = new Set(store.entries.map((entry) => entry.id));
  const additions = legacy.filter((entry) => !existingIds.has(entry.id));

  if (additions.length === 0) {
    return store;
  }

  return {
    version: 2,
    entries: [...additions, ...store.entries].slice(0, MAX_LEARNED_ENTRIES),
    model: store.model,
  };
}

function sanitizeModel(raw: unknown): LearnedInferenceModel {
  if (!raw || typeof raw !== "object") {
    return defaultLearnedInferenceModel;
  }

  const candidate = raw as Partial<LearnedInferenceModel>;

  const attributeAnswerCounts = Object.fromEntries(
    Object.entries(candidate.attributeAnswerCounts ?? {}).filter(
      ([key, value]) => typeof key === "string" && typeof value === "number" && Number.isFinite(value) && value >= 0,
    ),
  );

  const readEntityCounts = Object.fromEntries(
    Object.entries(candidate.readEntityCounts ?? {}).filter(
      ([key, value]) => typeof key === "string" && typeof value === "number" && Number.isFinite(value) && value >= 0,
    ),
  );

  const questionStats = Object.fromEntries(
    Object.entries(candidate.questionStats ?? {}).flatMap(([key, value]) => {
      if (
        !value ||
        typeof value !== "object" ||
        typeof (value as { askedCount?: unknown }).askedCount !== "number" ||
        typeof (value as { totalEntropyDrop?: unknown }).totalEntropyDrop !== "number"
      ) {
        return [];
      }

      const askedCount = Math.max(0, (value as { askedCount: number }).askedCount);
      const totalEntropyDrop = Math.max(0, (value as { totalEntropyDrop: number }).totalEntropyDrop);
      return [[key, { askedCount, totalEntropyDrop }]];
    }),
  );

  return {
    version: 1,
    attributeAnswerCounts,
    questionStats,
    readEntityCounts,
  };
}
