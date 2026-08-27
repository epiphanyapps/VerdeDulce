import type { Locale } from "@/i18n/routing";

/**
 * Ecuador is on the US dollar, so both locales format as USD — only the
 * separators and symbol placement differ.
 */
export function formatPrice(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "es" ? "es-EC" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
