import { test, expect } from "@playwright/test";
import { sitemapPaths } from "./helpers";

const paths = sitemapPaths();

test.describe("every sitemap route", () => {
  test("the sitemap is not empty", () => {
    // Guards against the suite silently passing because it found no routes.
    expect(paths.length).toBeGreaterThan(30);
  });

  for (const path of paths) {
    test(`${path} is well-formed`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), "should not 404 or redirect to an error").toBe(200);

      // Exactly one h1 — several pages nearly regressed this when the shared
      // PageShell was introduced.
      await expect(page.locator("h1")).toHaveCount(1);

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical, `${path} must declare a canonical`).toBeTruthy();
      // The canonical must match the URL actually served. Trailing-slash drift
      // between the two has already broken this site once.
      expect(new URL(canonical!).pathname).toBe(path);

      // hreflang must be reciprocal, plus x-default.
      const hreflangs = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((els) =>
          els.map((el) => el.getAttribute("hreflang")).sort(),
        );
      expect(hreflangs).toEqual(["en", "es", "x-default"]);

      // Every indexable page needs a preview image, and exactly one.
      const ogImages = page.locator('meta[property="og:image"]');
      await expect(ogImages).toHaveCount(1);
      const og = await ogImages.getAttribute("content");
      expect(og).toMatch(/\.png$/);

      // The card must actually resolve — this is the failure that shipped to
      // production, where extensionless URLs 301'd into a 404.
      const ogResponse = await page.request.get(
        new URL(og!).pathname,
        { headers: { Accept: "image/*" } },
      );
      expect(ogResponse.status(), `${og} must be reachable`).toBe(200);
      expect(ogResponse.headers()["content-type"]).toContain("image/png");

      expect(await page.title()).not.toBe("");
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    });
  }
});

test("unknown paths return a real 404, not a soft 404", async ({ request }) => {
  const response = await request.get("/es/definitely-not-a-page/", {
    maxRedirects: 0,
  });
  // A 200 here would mean the SPA catch-all is back and every missing page is
  // being indexed as content.
  expect(response.status()).not.toBe(200);
});
