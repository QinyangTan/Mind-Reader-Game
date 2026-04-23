import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function source(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("public-game UX source guards", () => {
  it("keeps ad dismissal page-lifecycle only so ads reappear after refresh", () => {
    const slot = source("components/brand/timed-ad-slot.tsx");

    expect(slot).not.toContain("sessionStorage");
    expect(slot).toContain("const closed = closedAdId === id");
    expect(slot).toContain("setClosedAdId(id)");
    expect(slot).toContain("const CLOSE_DELAY_SECONDS = 15");
  });

  it("keeps Guess My Mind as a layered inquiry flow instead of a flat question wall", () => {
    const browser = source("components/game/question-browser.tsx");

    expect(browser).toContain("Layer A · Broad Openers");
    expect(browser).toContain("Layer E · Fine Detail");
    expect(browser).toContain("visibleFamilies = familyBuckets.slice(0, 4)");
    expect(browser).toContain("slice(0, showMore ? 5 : 3)");
    expect(browser).not.toContain("questionFamilies.map");
  });
});
