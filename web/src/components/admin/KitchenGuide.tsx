import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getMenuSections } from "@/content/menu";
import { formatPrice } from "@/lib/format";
import {
  assembly,
  kitchenStats,
  portions,
  prepByStation,
  shoppingList,
  unmappedComponents,
  usedComponents,
  dishComponents,
} from "@/lib/kitchen";

/**
 * The operating brief, derived from the live menu.
 *
 * Written for a phone propped on a kitchen counter: generous type, one idea
 * per block, and no interaction required to read any of it. It also prints
 * cleanly, because a laminated sheet beats a phone with wet hands.
 */

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid border-t border-border-subtle pt-8">
      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-dim">
        {title}
      </h2>
      {hint && <p className="mt-1 text-sm text-on-surface-dim">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export async function KitchenGuide({ locale }: { locale: Locale }) {
  const t = await getTranslations("kitchen");
  const stats = kitchenStats();
  const sections = getMenuSections();
  const gaps = unmappedComponents();

  return (
    <article className="mt-10 flex flex-col gap-10">
      {/* Scale first: the sheet should state what it is asking of the kitchen. */}
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t("stats.dishes"), value: stats.dishes },
          { label: t("stats.components"), value: stats.components },
          { label: t("stats.sauces"), value: stats.sauces },
          { label: t("stats.singleUse"), value: stats.singleUse },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-surface-muted p-4">
            <dt className="text-xs uppercase tracking-[0.08em] text-on-surface-dim">
              {stat.label}
            </dt>
            <dd className="mt-1 font-display text-3xl leading-none">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {gaps.length > 0 && (
        // A dish added without kitchen.json coverage would otherwise quietly
        // drop off the shopping list.
        <p className="rounded-xl border border-current px-4 py-3 text-sm text-angry">
          {t("gaps", { list: gaps.map((g) => g.key).join(", ") })}
        </p>
      )}

      <Section title={t("menu.title")} hint={t("menu.hint")}>
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.category.id}>
              <h3 className="font-display text-lg">{section.category.name[locale]}</h3>
              <ul role="list" className="mt-3 divide-y divide-border-subtle border-y border-border-subtle">
                {section.items.map((item) => (
                  <li key={item.slug} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h4 className="font-display text-lg">{item.name[locale]}</h4>
                      <span className="font-display tabular-nums">
                        {formatPrice(item.price, locale)}
                      </span>
                    </div>
                    <ul role="list" className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-on-surface-dim">
                      {dishComponents(item).map((component) => (
                        <li key={component} className="after:content-['·'] after:pl-2 last:after:content-['']">
                          {component}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("shopping.title")} hint={t("shopping.hint")}>
        <div className="grid gap-8 sm:grid-cols-2">
          {shoppingList().map((group) => (
            <div key={group.id}>
              <h3 className="font-display text-lg">{group.name[locale]}</h3>
              <ul role="list" className="mt-3 flex flex-col gap-2">
                {group.entries.map((entry) => (
                  <li key={entry.key} className="flex items-baseline justify-between gap-4 text-sm">
                    <span>{entry.label[locale]}</span>
                    {/* How many dishes break if this runs out. */}
                    <span className="shrink-0 tabular-nums text-on-surface-dim">
                      {t("inDishes", { count: entry.dishes.length })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("prep.title")} hint={t("prep.hint")}>
        <div className="flex flex-col gap-6">
          {prepByStation().map((station) => (
            <div key={station.id} className="rounded-xl bg-surface-muted p-5">
              <h3 className="font-display text-lg">{station.name[locale]}</h3>
              {station.note && (
                <p className="mt-1 text-sm text-on-surface-dim">{station.note[locale]}</p>
              )}
              <ul role="list" className="mt-4 flex flex-col gap-3">
                {station.entries.map((entry) => (
                  <li key={entry.key}>
                    <p className="font-medium">
                      {entry.label[locale]}
                      <span className="ml-2 text-sm font-normal text-on-surface-dim">
                        {t("inDishes", { count: entry.dishes.length })}
                      </span>
                    </p>
                    {entry.prep && (
                      <p className="text-sm text-on-surface-dim">{entry.prep[locale]}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-10 sm:grid-cols-2">
        <Section title={t("assembly.title")}>
          <ol className="flex flex-col gap-2">
            {assembly[locale].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-semibold text-lime">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Section>

        <Section title={t("portions.title")} hint={t("portions.hint")}>
          <dl className="divide-y divide-border-subtle border-y border-border-subtle">
            {portions.map((portion) => (
              <div key={portion.amount + portion.item.es} className="flex justify-between gap-4 py-2.5">
                <dt>{portion.item[locale]}</dt>
                <dd className="tabular-nums text-on-surface-dim">{portion.amount}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>

      <p className="border-t border-border-subtle pt-6 text-sm text-on-surface-dim">
        {t("derived", { count: usedComponents().length })}
      </p>
    </article>
  );
}
