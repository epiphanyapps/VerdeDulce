import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { siteConfig } from "./config";

/**
 * Open Graph image for a page, as an explicit `.png` URL.
 *
 * Next's `opengraph-image.tsx` convention outranks metadata declared in a
 * layout, and the URL it generates has no file extension — which Amplify 301s
 * into a 404 under `trailingSlash: true`. Declaring the image at page level
 * wins over the convention, and `scripts/emit-og-png.mjs` writes the `.png`
 * sibling that this points at.
 */
export function ogImage(locale: Locale, path = "") {
  return [
    {
      url: `${siteConfig.url}/${locale}${path}/opengraph-image.png`,
      width: 1200,
      height: 630,
      alt: siteConfig.name,
    },
  ];
}

/**
 * Builds title/description/canonical/hreflang for a secondary page from its
 * `metadata.<key>` message namespace, so each page file does not repeat it.
 */
export async function pageMetadata(
  locale: Locale,
  key: string,
  path: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `metadata.${key}` });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: { images: ogImage(locale) },
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        es: `/es${path}`,
        en: `/en${path}`,
        "x-default": `/es${path}`,
      },
    },
  };
}
