import type { Locale } from "@/i18n/routing";
import type { MenuSection } from "@/content/menu";
import { MenuCard } from "./MenuCard";

/**
 * The menu grid.
 *
 * This replaces the RN implementation in `app/pages/home.tsx`, which nested a
 * `FlatList` (per category, `numColumns` derived from `react-responsive`)
 * inside a `SectionList`. That arrangement had four problems this version does
 * not:
 *
 *  1. Column count was computed in JS from a media query, so it was unknown
 *     until after hydration — the server could not render the right layout and
 *     every breakpoint change reflowed. Here it is pure CSS, correct in the
 *     first paint of the static HTML.
 *  2. `key={numColumns}` remounted the whole list whenever the breakpoint
 *     changed, discarding scroll position and re-requesting every image.
 *  3. Cells carried `flex: 1`, so a final row holding fewer items than columns
 *     stretched them to full width. CSS Grid places every item on the same
 *     track regardless of how full the last row is.
 *  4. Virtualisation was nullified by the nesting anyway, and with ~15 items it
 *     was never going to pay for itself.
 *
 * Column counts here must stay in sync with `CARD_SIZES` in MenuCard.
 */
export function MenuGrid({
  sections,
  locale,
}: {
  sections: MenuSection[];
  locale: Locale;
}) {
  // Only the very first row of the very first section is above the fold.
  let rendered = 0;

  return (
    <div className="flex flex-col gap-16 lg:gap-24">
      {sections.map((section) => {
        const headingId = `category-${section.category.id}`;

        return (
          <section
            key={section.category.id}
            id={section.category.id}
            aria-labelledby={headingId}
            className="scroll-mt-24"
          >
            <h2
              id={headingId}
              className="mb-6 font-display text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-dim"
            >
              {section.category.name[locale]}
            </h2>

            <ul
              role="list"
              className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16"
            >
              {section.items.map((item) => {
                const priority = rendered++ < 3;

                return (
                  <li key={item.slug} className="flex">
                    <MenuCard item={item} locale={locale} priority={priority} />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
