import { test, expect } from "@playwright/test";
import { onSaleCount } from "./helpers";

test.describe("navigation", () => {
  test("the skip link is reachable by keyboard and jumps to content", async ({ page, browserName }) => {
    // Safari only tabs to links when "Press Tab to highlight each item" is
    // enabled, which is off by default and not settable from Playwright. The
    // link's existence and target are still asserted below on every engine.
    test.skip(browserName === "webkit", "WebKit does not tab to links by default");
    await page.goto("/es/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("the skip link exists and targets main", async ({ page }) => {
    await page.goto("/es/");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toHaveAttribute("href", "#main");
    await expect(page.locator("#main")).toBeVisible();
  });

  test("the menu grid is a list of articles", async ({ page }) => {
    await page.goto("/es/");
    // Semantic markup is the reason this rewrite exists; assert it rather than
    // trusting it. The count comes from the content so a menu change is not
    // reported as a test failure.
    await expect(page.locator("main article")).toHaveCount(onSaleCount());
    await expect(page.locator("main ul[role='list']").first()).toBeVisible();
  });

  test("category jump links scroll to their section", async ({ page }) => {
    await page.goto("/es/menu/");
    await page.getByRole("link", { name: "Ensaladas" }).click();
    await expect(page).toHaveURL(/#ensaladas$/);
    await expect(page.locator("#ensaladas")).toBeVisible();
  });

  test("FAQ answers are in the DOM without JavaScript", async ({ browser }) => {
    // <details> must work with JS off, both for resilience and so crawlers see
    // the answers.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/es/faq/");
    await expect(page.locator("details")).toHaveCount(9);
    await expect(
      page.getByText("Verde Dulce es un restaurante de comida rápida"),
    ).toBeAttached();
    await context.close();
  });
});

test.describe("mobile navigation", () => {
  // A viewport override rather than a device preset: presets set
  // defaultBrowserType, which Playwright refuses inside a describe block
  // because it would force a new worker. The mobile-safari project in the
  // config covers real iOS engine behaviour.
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("opens, closes on Escape, and locks background scroll", async ({ page }) => {
    await page.goto("/es/");
    // Located by aria-controls, not by name: the accessible name correctly
    // flips to "Cerrar menú de navegación" once the panel is open, so a
    // name-based locator stops matching the element it just clicked.
    const toggle = page.locator('button[aria-controls="mobile-nav"]');
    await toggle.click();

    const nav = page.locator("#mobile-nav");
    await expect(nav).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    // The scroll lock must be released, or the page is stuck.
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });

  test("closes when navigating", async ({ page }) => {
    await page.goto("/es/");
    await page.locator('button[aria-controls="mobile-nav"]').click();
    await page.locator("#mobile-nav").getByRole("link", { name: "Menú" }).click();
    await expect(page).toHaveURL(/\/es\/menu\/$/);
    await expect(page.locator("#mobile-nav")).toBeHidden();
  });
});
