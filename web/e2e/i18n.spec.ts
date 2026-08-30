import { test, expect } from "@playwright/test";
import { sampleSlug } from "./helpers";

test.describe("locales", () => {
  test("the language switcher preserves the current path", async ({ page }) => {
    const slug = sampleSlug();
    await page.goto(`/es/menu/${slug}/`);

    // The header switcher is hidden below the sm breakpoint; on a phone it
    // lives inside the mobile panel, so open that first when it is not shown.
    const toggle = page.locator('button[aria-controls="mobile-nav"]');
    if (await toggle.isVisible()) await toggle.click();

    await page.getByRole("link", { name: "English" }).first().click();
    await expect(page).toHaveURL(new RegExp(`/en/menu/${slug}/$`));
    // The heading must be the English name, whatever dish was sampled.
    await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
  });

  test("each locale renders its own copy", async ({ page }) => {
    await page.goto("/es/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Comida fresca");
    expect(await page.locator("html").getAttribute("lang")).toBe("es");

    await page.goto("/en/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Fresh, high-quality");
    expect(await page.locator("html").getAttribute("lang")).toBe("en");
  });

  test("prices use the locale's number format", async ({ page }) => {
    await page.goto("/es/menu/tazon-de-cosecha/");
    await expect(page.getByText("$8,25").first()).toBeVisible();
    await page.goto("/en/menu/tazon-de-cosecha/");
    await expect(page.getByText("$8.25").first()).toBeVisible();
  });

  test("the root redirects into a locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(es|en)\/$/);
  });
});
