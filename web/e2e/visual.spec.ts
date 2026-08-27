import { test, expect } from "@playwright/test";
import { PAGE_SAMPLE } from "./helpers";

/**
 * Full-page snapshots of one page per template. Baselines are per platform and
 * per browser, so they must be generated on the machine that will compare them
 * — in CI that means committing Linux baselines, produced with
 * `pnpm test:e2e:update` inside the Playwright container.
 */
test.describe("visual", () => {
  for (const { path, name } of PAGE_SAMPLE) {
    test(`${name} looks right`, async ({ page }, testInfo) => {
      test.skip(
        !["chromium", "mobile-safari"].includes(testInfo.project.name),
        "one desktop and one mobile engine is enough signal",
      );

      await page.goto(path);
      // Fonts must be settled or the first run captures fallback metrics.
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
    });
  }
});
