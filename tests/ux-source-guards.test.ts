import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function source(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("public-game UX source guards", () => {
  it("keeps Google AdSense off the global layout and gameplay route", () => {
    expect(source("app/layout.tsx")).not.toContain("googlesyndication");
    expect(source("app/play/page.tsx")).not.toContain("AdSenseLoader");
    expect(source("app/play/page.tsx")).not.toContain("googlesyndication");
    expect(source("components/site/adsense-loader.tsx")).toContain("ADSENSE_ALLOWED_ROUTES");
    expect(source("components/site/adsense-loader.tsx")).toContain("/play*");
  });

  it("keeps homepage publisher content below a clean ad-free hero", () => {
    const landing = source("components/game/landing-page.tsx");

    expect(landing).toContain("showExampleAds={false}");
    expect(landing).toContain("AdSense publisher-content compliance");
    expect(landing).toContain("What Mind Reader is");
    expect(landing).toContain("How Mora's inference works");
    expect(landing).not.toContain("TimedAdSlot");
  });

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
    expect(browser).toContain("visibleFamilies = familyBuckets.slice(0, 3)");
    expect(browser).toContain("slice(0, showMore ? 4 : 2)");
    expect(browser).toContain("recommendationHint");
    expect(browser).toContain("Switch family");
    expect(browser).not.toContain("questionFamilies.map");
  });
});
