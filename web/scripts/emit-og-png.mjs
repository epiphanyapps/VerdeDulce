import { readdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Next's opengraph-image convention emits files with no extension
 * (out/es/opengraph-image). Two things break on Amplify as a result:
 *
 *   1. `trailingSlash: true` makes Amplify 301 an extensionless path to a
 *      trailing-slash form, which then 404s — so the card is unreachable.
 *   2. Content-Type is inferred from the extension, so it would be served as
 *      application/octet-stream and rejected by every social scraper.
 *
 * Copying each one to a real .png sibling sidesteps both. The metadata points
 * at the .png URL, so this is the file that actually gets requested.
 */
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "out");

async function walk(dir) {
  let copied = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "_next") copied += await walk(path);
    } else if (entry.name === "opengraph-image") {
      await copyFile(path, `${path}.png`);
      copied += 1;
    }
  }
  return copied;
}

console.log(`[og] wrote ${await walk(OUT)} .png copies`);
