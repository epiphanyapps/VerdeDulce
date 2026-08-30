import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { pageSample } from "./helpers";

// axe is browser-agnostic; running it once keeps CI time proportionate.
test.describe.configure({ mode: "parallel" });

for (const { path, name } of pageSample()) {
  test(`${name} has no serious accessibility violations`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "axe runs once, on chromium");

    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );

    // Reported with the offending selectors so a failure is actionable.
    expect(
      serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`),
    ).toEqual([]);
  });
}
