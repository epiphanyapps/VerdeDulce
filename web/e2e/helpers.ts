import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Routes are read from the generated sitemap rather than hard-coded, so adding
 * a dish or a page automatically widens coverage instead of silently escaping
 * it.
 */
export function sitemapPaths(): string[] {
  const xml = readFileSync(join(process.cwd(), "out", "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname)
    .sort();
}

export const LOCALES = ["es", "en"] as const;

/** A representative page of each distinct template, for the slower suites. */
export const PAGE_SAMPLE = [
  { path: "/es/", name: "landing" },
  { path: "/es/menu/", name: "menu" },
  { path: "/es/menu/tazon-de-cosecha/", name: "dish-with-photo" },
  { path: "/es/menu/pollo-bufalo/", name: "dish-placeholder" },
  { path: "/es/faq/", name: "faq" },
  { path: "/es/cart/", name: "cart" },
  { path: "/es/login/", name: "login" },
] as const;
