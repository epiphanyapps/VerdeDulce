"use client";

import { useTranslations } from "next-intl";
import { useCart } from "./CartProvider";

export function AddToCartButton({ slug }: { slug: string }) {
  const t = useTranslations("cart");
  const { add } = useCart();

  return (
    <button
      type="button"
      onClick={() => add(slug)}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest px-5 py-3 font-display text-base font-semibold text-forest transition-colors duration-200 hover:bg-forest hover:text-lime motion-reduce:transition-none"
    >
      {t("add")}
    </button>
  );
}
