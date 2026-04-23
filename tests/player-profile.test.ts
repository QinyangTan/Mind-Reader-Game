import { describe, expect, it } from "vitest";

import {
  createPlayerProfile,
  normalizeDisplayName,
  renamePlayerProfile,
  validateDisplayName,
} from "@/lib/game/player-profile";

describe("player profile", () => {
  it("normalizes display names and rejects unsafe values", () => {
    expect(normalizeDisplayName("  Mora   Reader  ")).toBe("Mora Reader");
    expect(validateDisplayName("A")).toBeTruthy();
    expect(validateDisplayName("Name<script>")).toBeTruthy();
    expect(validateDisplayName("Mora.Reader_7")).toBeNull();
  });

  it("keeps a stable player id across rename", () => {
    const profile = createPlayerProfile("First Name");
    const renamed = renamePlayerProfile(profile, "Second Name");

    expect(renamed.id).toBe(profile.id);
    expect(renamed.displayName).toBe("Second Name");
  });
});
