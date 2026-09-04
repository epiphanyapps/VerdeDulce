import { defineFunction } from "@aws-amplify/backend";

/**
 * Runs before Cognito creates a user, so a Google sign-in can be attached to an
 * account that already exists with the same email instead of becoming a second,
 * unrelated user.
 */
export const preSignUp = defineFunction({
  name: "pre-sign-up",
  entry: "./handler.ts",
  // Two Cognito calls and no cold-start-sensitive work; the default 512 MB is
  // more than this needs.
  memoryMB: 256,
  timeoutSeconds: 10,
});
