import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function source(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("scene flow regression guards", () => {
  it("keeps Chamber Memory and World Rank as true archive scene states", () => {
    const gameShell = source("components/game/game-shell.tsx");
    const controllers = source("components/game/game-shell-controllers.ts");

    expect(controllers).toContain('"memory"');
    expect(controllers).toContain('"world-rank"');
    expect(controllers).toContain('openUtilityScene("memory")');
    expect(controllers).toContain('openUtilityScene("world-rank")');
    expect(gameShell).toMatch(
      /screen === "memory" \|\| screen === "world-rank"\s*\?\s*"archive"/,
    );
    expect(gameShell).toMatch(/screen === "memory"[\s\S]*<StatsPanel/);
    expect(gameShell).toMatch(/screen === "world-rank"[\s\S]*<WorldRankPanel/);
  });

  it("only shows Chamber Memory and World Rank on the mode-selection stage", () => {
    const gameShell = source("components/game/game-shell.tsx");
    const controllers = source("components/game/game-shell-controllers.ts");

    expect(gameShell).toContain('const showModeUtilities = screen === "setup" && setupStep === "mode";');
    expect(gameShell).toContain("showModeUtilities ? (");
    expect(controllers).toContain('setSetupStep("mode")');
  });

  it("does not auto-advance when a category is clicked", () => {
    const setup = source("components/game/play-setup.tsx");
    const categoryClick = setup.match(/onClick=\{\(\) => \{\s*const category[\s\S]*?\}\}/);

    expect(categoryClick?.[0]).toContain("choose({ category })");
    expect(categoryClick?.[0]).not.toContain("advance(");
    expect(categoryClick?.[0]).not.toContain("setStep(");
    expect(setup).toContain("onMouseEnter={() => setPreviewCategory");
    expect(setup).toContain("onFocus={() => setPreviewCategory");
  });
});
