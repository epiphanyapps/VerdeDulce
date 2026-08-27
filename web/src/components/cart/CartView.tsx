"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/format";
import { siteConfig, whatsappOrderUrl } from "@/lib/config";
import { MenuImage } from "../MenuImage";
import { useCart, type ResolvedLine } from "./CartProvider";

function QuantityStepper({ line }: { line: ResolvedLine }) {
  const t = useTranslations("cart");
  const { setQuantity } = useCart();

  return (
    <div className="inline-flex items-center rounded-lg border border-border-subtle">
      <button
        type="button"
        onClick={() => setQuantity(line.item.slug, line.quantity - 1)}
        aria-label={t("decrease")}
        className="size-9 text-lg leading-none text-forest"
      >
        −
      </button>
      <span
        aria-label={t("quantity")}
        className="w-8 text-center text-sm font-semibold tabular-nums"
      >
        {line.quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity(line.item.slug, line.quantity + 1)}
        aria-label={t("increase")}
        className="size-9 text-lg leading-none text-forest"
      >
        +
      </button>
    </div>
  );
}

export function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { lines, total, count, ready, remove } = useCart();

  // Render nothing decisive until the persisted cart has been read, so the
  // empty state does not flash for someone who has items.
  if (!ready) {
    return <p className="py-12 text-on-surface-dim">{t("empty")}</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="py-12">
        <p className="text-lg text-on-surface-dim">{t("empty")}</p>
        <Link
          href="/menu"
          className="mt-4 inline-block font-semibold text-forest underline underline-offset-4"
        >
          {t("browseMenu")}
        </Link>
      </div>
    );
  }

  // The order is handed to WhatsApp as plain text — there is no checkout
  // backend, matching how ordering works today.
  const message = [
    t("orderIntro"),
    ...lines.map(
      (line) =>
        `• ${line.quantity} × ${line.item.name[locale]} — ${formatPrice(line.subtotal, locale)}`,
    ),
    `${t("total")}: ${formatPrice(total, locale)}`,
  ].join("\n");

  return (
    <div className="py-8">
      <p className="text-sm text-on-surface-dim">{t("itemCount", { count })}</p>

      <ul role="list" className="mt-6 divide-y divide-border-subtle border-y border-border-subtle">
        {lines.map((line) => (
          <li key={line.item.slug} className="flex gap-4 py-5">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:size-24">
              <MenuImage
                item={line.item}
                locale={locale}
                sizes="96px"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <Link
                  href={`/menu/${line.item.slug}`}
                  className="font-display text-lg leading-tight hover:text-forest"
                >
                  {line.item.name[locale]}
                </Link>
                <span className="font-display text-lg tabular-nums">
                  {formatPrice(line.subtotal, locale)}
                </span>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-4">
                <QuantityStepper line={line} />
                <button
                  type="button"
                  onClick={() => remove(line.item.slug)}
                  className="text-sm text-on-surface-dim underline underline-offset-4 hover:text-forest"
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="font-display text-2xl">
          {t("total")}{" "}
          <span className="tabular-nums">{formatPrice(total, locale)}</span>
        </p>

        <a
          href={whatsappOrderUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream bg-forest px-5 py-3 font-display text-base font-semibold text-lime transition-colors duration-200 hover:border-forest hover:bg-cream hover:text-forest motion-reduce:transition-none"
        >
          {t("checkout")}
        </a>
      </div>

      <p className="mt-4 text-sm text-on-surface-dim">
        {siteConfig.name} · {t("orderIntro")}
      </p>
    </div>
  );
}
