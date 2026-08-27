"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { locales, type Locale } from "@/i18n/routing";

/**
 * Swaps locale while staying on the current page. `usePathname` from the
 * next-intl navigation helpers returns the pathname *without* the locale
 * prefix, so the same value can be re-rendered under the other locale.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const active = useLocale() as Locale;
  const t = useTranslations("language");

  return (
    <nav aria-label={t("label")} className={className}>
      <ul role="list" className="flex items-center gap-1 text-sm">
        {locales.map((locale, index) => (
          <li key={locale} className="flex items-center gap-1">
            {index > 0 && (
              <span aria-hidden="true" className="text-on-surface-dim/50">
                /
              </span>
            )}
            <Link
              href={pathname}
              locale={locale}
              hrefLang={locale}
              aria-current={locale === active ? "true" : undefined}
              className={
                locale === active
                  ? "font-semibold text-forest underline underline-offset-4"
                  : "text-on-surface-dim hover:text-forest"
              }
            >
              {t(locale)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
