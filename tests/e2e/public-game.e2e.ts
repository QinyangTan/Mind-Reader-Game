import { expect, test } from "@playwright/test";

async function createProfile(page: import("@playwright/test").Page, name = "E2E Player") {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByPlaceholder("Your player name")).toBeVisible();
  await page.getByPlaceholder("Your player name").fill(name);
  await page.getByRole("button", { name: new RegExp(`Enter as ${name}`, "i") }).click();
}

test.describe("Mind Reader public game smoke flow", () => {
  test("first visit creates a profile and reaches mode selection", async ({ page }) => {
    await createProfile(page, "Mora Tester");

    await expect(page.getByRole("button", { name: /Continue/i })).toBeVisible();
    await page.getByRole("button", { name: /Continue/i }).click();

    await expect(page.getByRole("button", { name: /Read My Mind/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Guess My Mind/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Chamber memory/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /World Rank/i })).toBeVisible();
  });

  test("category preview does not auto-advance before explicit continue", async ({ page }) => {
    await createProfile(page, "Category Tester");
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.getByRole("button", { name: /Read My Mind/i }).click();

    const characters = page.getByRole("button", { name: /Fictional Characters/i });
    await expect(characters).toBeVisible();
    await characters.hover();
    await expect(page.getByRole("button", { name: /Begin|Continue|Start/i })).toBeVisible();
    await expect(page.getByText(/Question 1/i)).toHaveCount(0);
  });

  test("mode-only utility buttons open and return", async ({ page }) => {
    await createProfile(page, "Memory Tester");
    await page.getByRole("button", { name: /Continue/i }).click();

    await page.getByRole("button", { name: /Chamber memory/i }).click();
    await expect(page.getByRole("button", { name: /Return/i })).toBeVisible();
    await page.getByRole("button", { name: /Return/i }).click();

    await page.getByRole("button", { name: /World Rank/i }).click();
    await expect(page.getByRole("button", { name: /Return/i })).toBeVisible();
    await page.getByRole("button", { name: /Return/i }).click();

    await expect(page.getByRole("button", { name: /Read My Mind/i })).toBeVisible();
  });

  test("ads render on refresh and expose their countdown labels", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Example Ad/i).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(/Example Ad/i).first()).toBeVisible();
    await expect(page.getByText(/Close in/i).first()).toBeVisible();
  });
});
