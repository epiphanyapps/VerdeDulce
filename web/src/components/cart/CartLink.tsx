"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCart } from "./CartProvider";

/** Header entry point to the cart, with a live item-count badge. */
export function CartLink() {
  const t = useTranslations("cart");
  const tNav = useTranslations("nav");
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-1.5 text-sm text-on-surface-dim transition-colors hover:text-forest"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0" />
      </svg>
      <span className="hidden sm:inline">{tNav("cart")}</span>
      {ready && count > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-forest px-1.5 py-0.5 text-xs font-semibold text-lime">
          {count}
        </span>
      )}
      {/* Announces the count to assistive tech without duplicating the label. */}
      <span className="sr-only">{ready ? t("itemCount", { count }) : ""}</span>
    </Link>
  );
}
