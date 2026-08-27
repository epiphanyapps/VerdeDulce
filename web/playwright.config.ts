import { defineConfig, devices } from "@playwright/test";

/**
 * Tests run against the built static export, served as plain files — the same
 * artifact Amplify deploys. Running them against `next dev` would exercise a
 * different renderer than production and would miss export-only problems, which
 * is exactly the class of bug that has bitten this site (extensionless Open
 * Graph files, trailing-slash redirects).
 *
 * Point BASE_URL at the deployed site to run the same specs as a post-deploy
 * smoke test.
 */
const PORT = 4330;
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;
const isExternal = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  // Every assertion here is against static output, so nothing is timing
  // dependent enough to need retries locally; CI retries once to absorb
  // genuine flake rather than mask it.
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  // Snapshots are compared per browser and platform: font rasterisation differs
  // between macOS and CI Linux, so a single baseline would never match both.
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{platform}-{projectName}-{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      // Absorbs sub-pixel text rendering differences without hiding real
      // layout regressions.
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // WebKit matters disproportionately here: the audience is Ecuador, which
    // skews heavily to iPhone, and Safari is where <details>, backdrop-filter
    // and private-mode localStorage actually diverge.
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],

  webServer: isExternal
    ? undefined
    : {
        // `serve` the export rather than `next start`: next start does not run
        // under output:export.
        command: `pnpm exec http-server out -p ${PORT} -s --no-dotfiles`,
        url: `http://127.0.0.1:${PORT}/es/`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
