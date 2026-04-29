import { expect, test, type Page } from "@playwright/test";

const profile = {
  version: 1,
  id: "e2e-player",
  displayName: "E2E Player",
  createdAt: "2026-04-23T00:00:00.000Z",
  updatedAt: "2026-04-23T00:00:00.000Z",
};

async function seedProfile(page: Page) {
  await page.addInitScript((playerProfile) => {
    window.localStorage.setItem(
      "mind-reader.player-profile.v1",
      JSON.stringify(playerProfile),
    );
  }, profile);
}

async function reachModeSelection(page: Page) {
  await seedProfile(page);
  await page.goto("/play");
  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page.getByRole("heading", { name: "Choose your ritual" })).toBeVisible();
}

async function advanceDefaultSetup(page: Page) {
  await page.getByRole("button", { name: /^Continue/i }).click();
  await expect(page.getByRole("heading", { name: "Choose a focus of thought" })).toBeVisible();
  await page.getByRole("button", { name: /Animals/i }).click();
  await expect(page.getByText(/Animals:/)).toBeVisible();
  await page.getByRole("button", { name: /^Continue/i }).click();
  await expect(page.getByRole("heading", { name: "Decide the pressure of the ritual" })).toBeVisible();
  await page.getByRole("button", { name: /^Continue/i }).click();
  await expect(page.getByRole("heading", { name: "The chamber is ready" })).toBeVisible();
  await page.getByRole("button", { name: /Begin the ritual/i }).click();
}

test("first-time player gate, encounter, mode selection, and category preview work", async ({ page }) => {
  await page.goto("/play");
  await expect(page.getByRole("heading", { name: /What name should the chamber remember/i })).toBeVisible();
  await page.getByPlaceholder("Your player name").fill("Browser Sage");
  await page.getByRole("button", { name: /Enter as Browser Sage/i }).click();

  await expect(page.getByRole("heading", { name: /thoughts do not stay hidden/i })).toBeVisible();
  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page.getByRole("heading", { name: "Choose your ritual" })).toBeVisible();

  await page.getByRole("button", { name: /Guess My Mind/i }).click();
  await page.getByRole("button", { name: /^Continue/i }).click();
  await page.getByRole("button", { name: /Historical Figures/i }).click();
  await expect(page.getByText(/Historical Figures:/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose a focus of thought" })).toBeVisible();
});

test("Read My Mind starts and advances after an answer", async ({ page }) => {
  await reachModeSelection(page);
  await advanceDefaultSetup(page);

  await expect(page.getByText(/Mora asks/i)).toBeVisible();
  await page.getByRole("button", { name: "Yes" }).click();
  await expect(page.getByText(/Question 2 of/i)).toBeVisible();
});

test("Guess My Mind uses a sparse layered inquiry and records a reply", async ({ page }) => {
  await reachModeSelection(page);
  await page.getByRole("button", { name: /Guess My Mind/i }).click();
  await advanceDefaultSetup(page);

  await expect(page.getByRole("heading", { name: "Choose your line of inquiry" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Show two more/i })).toBeVisible();
  const clueButtons = page.getByRole("button").filter({ hasText: /\?$/ });
  await expect(clueButtons).toHaveCount(2);
  await clueButtons.first().click();
  await expect(page.getByText("Response")).toBeVisible();
  await expect(page.getByText(/Question 2 of/i)).toBeVisible();
});

test("Chamber Memory and World Rank open and return from mode selection", async ({ page }) => {
  await reachModeSelection(page);

  await page.getByRole("button", { name: /Chamber memory/i }).click();
  await expect(page.getByText("Chamber memory")).toBeVisible();
  await expect(page.getByRole("heading", { name: /ritual ledger/i })).toBeVisible();
  await page.getByRole("button", { name: /Return/i }).first().click();
  await expect(page.getByRole("heading", { name: "Choose your ritual" })).toBeVisible();

  await page.getByRole("button", { name: /World Rank/i }).click();
  await expect(page.getByRole("heading", { name: /public ritual board/i })).toBeVisible();
  await page.getByRole("button", { name: /Return/i }).first().click();
  await expect(page.getByRole("heading", { name: "Choose your ritual" })).toBeVisible();
});

test("example ads render, close after the timer, and reappear after refresh", async ({ page }, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name.includes("mobile")) {
    await expect(page.getByRole("region", { name: /sponsored space/i })).toHaveCount(0);
    return;
  }

  await expect(page.getByRole("region", { name: /sponsored space/i })).toHaveCount(3);
  await expect(page.getByRole("region", { name: "top sponsored space" })).toContainText("Example Ad");
  await expect(page.getByRole("region", { name: "left sponsored space" })).toContainText("Example Ad");
  await expect(page.getByRole("region", { name: "right sponsored space" })).toContainText("Example Ad");
  await expect(page.getByRole("button", { name: /Ad can be closed in/i }).first()).toBeVisible();

  await page.waitForTimeout(16_000);
  await page.getByRole("button", { name: "Close ad" }).first().click();
  await expect(page.getByRole("region", { name: /sponsored space/i })).toHaveCount(2);

  await page.reload();
  await expect(page.getByRole("region", { name: /sponsored space/i })).toHaveCount(3);
});

test("footer public routes resolve", async ({ page }) => {
  for (const path of ["/about", "/contact", "/legal", "/terms", "/privacy", "/faq", "/press"]) {
    await page.goto(path);
    await expect(page.getByText("FOLLOW ME")).toBeVisible();
  }
});

test("public health endpoint reports readiness metadata", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);

  const body = await response.json();
  expect(body.status).toBe("ok");
  expect(body.content.entities).toBeGreaterThanOrEqual(3000);
  expect(body.content.questions).toBeGreaterThanOrEqual(350);
  expect(["server-memory", "upstash-redis"]).toContain(body.backend.storage);
  expect(typeof body.backend.durableConfigured).toBe("boolean");
  expect(typeof body.backend.redisConfigured).toBe("boolean");
  expect(body.analytics.mode).toBeTruthy();
});
