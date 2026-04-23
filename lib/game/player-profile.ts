import type { PlayerProfile } from "@/types/game";

const PLAYER_PROFILE_KEY = "mind-reader.player-profile.v1";

export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 18;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `player-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeDisplayName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function validateDisplayName(value: string) {
  const normalized = normalizeDisplayName(value);

  if (normalized.length < DISPLAY_NAME_MIN_LENGTH) {
    return "Use at least 2 characters.";
  }

  if (normalized.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Keep it ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`;
  }

  if (!/^[a-zA-Z0-9 _.-]+$/.test(normalized)) {
    return "Use letters, numbers, spaces, dots, dashes, or underscores only.";
  }

  return null;
}

export function createPlayerProfile(displayName: string): PlayerProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: createId(),
    displayName: normalizeDisplayName(displayName),
    createdAt: now,
    updatedAt: now,
  };
}

export function renamePlayerProfile(profile: PlayerProfile, displayName: string): PlayerProfile {
  return {
    ...profile,
    displayName: normalizeDisplayName(displayName),
    updatedAt: new Date().toISOString(),
  };
}

export function loadPlayerProfile(): PlayerProfile | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PLAYER_PROFILE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    if (
      parsed.version !== 1 ||
      !parsed.id ||
      !parsed.displayName ||
      validateDisplayName(parsed.displayName)
    ) {
      return null;
    }

    return {
      version: 1,
      id: parsed.id,
      displayName: normalizeDisplayName(parsed.displayName),
      createdAt: parsed.createdAt ?? new Date().toISOString(),
      updatedAt: parsed.updatedAt ?? parsed.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function savePlayerProfile(profile: PlayerProfile) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(profile));
}

export function clearPlayerProfile() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(PLAYER_PROFILE_KEY);
}
