"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";
import { CTAAnchor, ArrowIcon } from "./CTALink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CartLink } from "./cart/CartLink";

const NAV = [
  { href: "/menu", key: "menu" },
  { href: "/loyalty", key: "loyalty" },
  { href: "/gift", key: "gift" },
  { href: "/faq", key: "faq" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const tHome = useTranslations("home");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile panel on navigation — the panel is not unmounted by the
  // route change on its own.
  useEffect(() => setOpen(false), [pathname]);

  // Prevent the page behind the open panel from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-forest"
        >
          {t("brand")}
        </Link>

        <nav aria-label={t("menu")} className="hidden md:block">
          <ul role="list" className="flex items-center gap-6 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={
                    isActive(item.href)
                      ? "font-semibold text-forest underline underline-offset-8"
                      : "text-on-surface-dim transition-colors hover:text-forest"
                  }
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitcher className="hidden sm:block" />
          <CartLink />
          <Link
            href="/account"
            className="hidden text-sm text-on-surface-dim transition-colors hover:text-forest sm:inline"
          >
            {t("account")}
          </Link>
          <CTAAnchor
            href={siteConfig.whatsapp.catalogUrl}
            className="hidden px-4 py-2 text-sm sm:inline-flex"
          >
            {tHome("orderNow")}
            <ArrowIcon />
          </CTAAnchor>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            className="-mr-2 inline-flex size-10 items-center justify-center rounded-lg text-forest md:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="size-6"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={t("menu")}
          className="border-t border-border-subtle bg-surface md:hidden"
        >
          <ul role="list" className="flex flex-col px-4 py-2 sm:px-6">
            {[...NAV, { href: "/account", key: "account" } as const].map(
              (item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="block border-b border-border-subtle py-3 font-display text-lg last:border-b-0"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <div className="flex items-center justify-between gap-4 px-4 pb-4 sm:px-6">
            <LanguageSwitcher />
            <CTAAnchor
              href={siteConfig.whatsapp.catalogUrl}
              className="px-4 py-2 text-sm"
            >
              {tHome("orderNow")}
              <ArrowIcon />
            </CTAAnchor>
          </div>
        </nav>
      )}
    </header>
  );
}
