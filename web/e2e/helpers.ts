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

/**
 * Menu facts read from the content itself.
 *
 * Hard-coding dish counts or slugs makes every menu change look like a test
 * failure — which is exactly what happened when the menu was cut from fourteen
 * dishes to six.
 */
type RawItem = { slug: string; hidden: boolean; available: boolean; image: string | null };

function items(): RawItem[] {
  const raw = readFileSync(
    join(process.cwd(), "src", "content", "menu.json"),
    "utf8",
  );
  return (JSON.parse(raw).items as RawItem[]).filter(
    (item) => !item.hidden && item.available,
  );
}

/**
 * Items that render as cards on the menu and landing pages — drinks included,
 * since they are menu items and get a card like anything else.
 */
export function onSaleCount(): number {
  return items().length;
}

/** A slug guaranteed to exist, for tests that just need any dish page. */
export function sampleSlug(): string {
  return items()[0]!.slug;
}

/**
 * One page per distinct template, for the slower suites.
 *
 * The two dish pages are chosen from the content rather than named, because a
 * dish with a photograph and a dish without render different components — and
 * naming them meant the sample broke when the menu was cut.
 */
export function pageSample(): { path: string; name: string }[] {
  const all = items();
  const withPhoto = all.find((item) => item.image);
  const withoutPhoto = all.find((item) => !item.image);

  return [
    { path: "/es/", name: "landing" },
    { path: "/es/menu/", name: "menu" },
    ...(withPhoto
      ? [{ path: `/es/menu/${withPhoto.slug}/`, name: "dish-with-photo" }]
      : []),
    ...(withoutPhoto
      ? [{ path: `/es/menu/${withoutPhoto.slug}/`, name: "dish-placeholder" }]
      : []),
    { path: "/es/faq/", name: "faq" },
    { path: "/es/cart/", name: "cart" },
    { path: "/es/login/", name: "login" },
  ];
}
