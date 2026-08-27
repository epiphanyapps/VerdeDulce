import type { MetadataRoute } from "next";
import { menuItems } from "@/content/menu";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";

/** Required under `output: "export"` — emits the file at build time instead of
 * treating the route as a dynamic handler. */
export const dynamic = "force-static";


/** Public, indexable routes. Auth-gated and cart pages are deliberately absent. */
const STATIC_PATHS = ["", "/menu", "/faq", "/gift", "/loyalty"] as const;

/**
 * `trailingSlash: true` is set in next.config, so every emitted canonical ends
 * in a slash. Sitemap entries must match those exactly or the two disagree
 * about which URL is authoritative.
 */
function url(locale: string, path: string) {
  return `${siteConfig.url}/${locale}${path}/`.replace(/\/{2,}$/, "/");
}

function alternates(path: string) {
  return {
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, url(locale, path)]),
    ),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...menuItems.map((item) => `/menu/${item.slug}`),
  ];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: url(locale, path),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path === "/menu" ? 0.9 : 0.7,
      alternates: alternates(path),
    })),
  );
}
