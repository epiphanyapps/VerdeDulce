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

/**
 * Day and month for the loyalty stamp history — no year, since a card is a
 * matter of weeks, and no time, which would only add noise to a list people
 * scan to check a visit was counted.
 */
export function formatShortDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-EC" : "en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}
