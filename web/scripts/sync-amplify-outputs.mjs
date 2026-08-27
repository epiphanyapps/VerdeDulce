import { copyFileSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "../../amplify_outputs.json");
const target = resolve(here, "../src/generated/amplify_outputs.json");

mkdirSync(dirname(target), { recursive: true });

if (existsSync(source)) {
  copyFileSync(source, target);
  console.log("[amplify] copied amplify_outputs.json");
} else if (!existsSync(target)) {
  // Amplify CI generates the real file during the backend phase. Writing an
  // empty stub keeps `next build` compiling; Amplify.configure treats it as
  // "not configured" and the auth-gated pages render their signed-out state.
  writeFileSync(target, "{}\n");
  console.warn("[amplify] amplify_outputs.json not found — wrote empty stub");
}
