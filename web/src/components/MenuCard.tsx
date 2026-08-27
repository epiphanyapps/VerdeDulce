import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import type { MenuItem } from "@/content/menu";
import { formatPrice } from "@/lib/format";
import { NutritionBullets } from "./NutritionBullets";

/**
 * `sizes` must mirror MenuGrid's column counts, otherwise the browser
 * downloads a wider candidate than it can ever paint. Grid is 1 column below
 * 40rem, 2 below 64rem, 3 above, inside a container that maxes out at 80rem.
 */
const CARD_SIZES = "(min-width: 64rem) 25rem, (min-width: 40rem) 45vw, 92vw";

export function MenuCard({
  item,
  locale,
  /** The first row is above the fold; let it load eagerly to help LCP. */
  priority = false,
}: {
  item: MenuItem;
  locale: Locale;
  priority?: boolean;
}) {
  const t = useTranslations("menu");
  const tn = useTranslations("nutrition");

  const name = item.name[locale];
  const price = formatPrice(item.price, locale);

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/menu/${item.slug}`}
        className="flex h-full flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-muted">
          <Image
            src={item.image}
            alt=""
            fill
            sizes={CARD_SIZES}
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>

        <h3 className="mt-4 font-display text-xl font-light leading-snug">
          {name}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-on-surface-dim">
          {item.description[locale]}
        </p>

        <p className="mt-4 inline-flex w-fit items-baseline gap-1.5 rounded-md border-[1.5px] border-current px-2 py-0.5 text-sm font-medium">
          <span>{price}</span>
          <span aria-hidden="true">·</span>
          <span>
            {item.nutrition.calories} {tn("shortCalories")}
          </span>
        </p>

        <NutritionBullets nutrition={item.nutrition} className="mt-4" />

        {/* Gives the link an unambiguous accessible name without repeating the
            visible text for sighted users. */}
        <span className="sr-only">{t("viewItem", { item: name })}</span>
      </Link>
    </article>
  );
}
