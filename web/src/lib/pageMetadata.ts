import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

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
