"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/generated/amplify_outputs.json";

/**
 * Configures the Amplify client SDK in the browser.
 *
 * `ssr: true` is intentional even on a static export — it makes the SDK store
 * tokens in cookies rather than localStorage, which is the safer default and
 * leaves the door open for server-side auth if this ever moves onto Amplify's
 * compute platform.
 *
 * Called at module scope so it runs once per page load, before any component
 * that reads auth state renders.
 */
const isConfigured = Object.keys(outputs).length > 0;

if (isConfigured) {
  Amplify.configure(outputs as Parameters<typeof Amplify.configure>[0], {
    ssr: true,
  });
}

export function amplifyConfigured(): boolean {
  return isConfigured;
}

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
