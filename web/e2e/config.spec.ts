import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards against testing a build that carries stale Amplify configuration.
 *
 * `amplify_outputs.json` is copied into the module graph by a `prebuild`
 * script, so invoking `next build` directly — as is easy to do — silently
 * produces a bundle pointing at whatever backend was current the last time
 * `pnpm build` ran. That happened here: the auth suite failed against a
 * deleted Cognito pool, and the failure looked like broken sign-in rather
 * than a stale artifact.
 */
test("the build targets the current Cognito pool", async () => {
  const root = join(process.cwd(), "..", "amplify_outputs.json");
  test.skip(!existsSync(root), "no local amplify_outputs.json to compare against");

  const expected = JSON.parse(readFileSync(root, "utf8"))?.auth?.user_pool_id;
  test.skip(!expected, "amplify_outputs.json has no auth section");

  const generated = JSON.parse(
    readFileSync(join(process.cwd(), "src", "generated", "amplify_outputs.json"), "utf8"),
  )?.auth?.user_pool_id;

  expect(
    generated,
    "run `pnpm build` (not `next build`) so the outputs sync runs first",
  ).toBe(expected);
});
