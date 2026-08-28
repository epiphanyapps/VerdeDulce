import kitchen from "@/content/kitchen.json";
import { getMenuSections, menuItems, type MenuItem } from "@/content/menu";
import type { Locale } from "@/i18n/routing";

/**
 * Turns the customer-facing menu into a kitchen brief.
 *
 * The shopping and prep lists are *derived* from menu.json rather than written
 * out separately. That is the whole point: an operational sheet maintained by
 * hand drifts from the menu the moment a dish changes, and the kitchen is then
 * working from something the site contradicts. Here, changing a dish changes
 * the brief.
 *
 * Dish descriptions are already comma-separated ingredient lists, so they are
 * the source. kitchen.json only adds what cannot be inferred: which station
 * preps a component, which aisle buys it, and how it is made.
 */

type ComponentMeta = {
  station: string;
  shopping: string;
  en: string;
  prep?: Record<Locale, string>;
};

const components = kitchen.components as Record<string, ComponentMeta>;

const normalise = (value: string) => value.toLowerCase().trim().replace(/\s+/g, " ");

/** Components of one dish, in menu order. */
export function dishComponents(item: MenuItem): string[] {
  return item.description.es.split(",").map(normalise).filter(Boolean);
}

export type UsedComponent = {
  key: string;
  label: Record<Locale, string>;
  station: string;
  shopping: string;
  prep?: Record<Locale, string>;
  /** Dishes that need it — drives the "used in N dishes" ordering. */
  dishes: MenuItem[];
};

/**
 * Every component the current menu actually requires, with the dishes that use
 * it. Sorted by how many dishes depend on each, so the things that must never
 * run out sort to the top of the shopping list.
 */
export function usedComponents(): UsedComponent[] {
  const byKey = new Map<string, UsedComponent>();

  for (const item of menuItems) {
    for (const key of dishComponents(item)) {
      const meta = components[key];
      const existing = byKey.get(key);
      if (existing) {
        existing.dishes.push(item);
        continue;
      }
      byKey.set(key, {
        key,
        label: { es: key, en: meta?.en ?? key },
        // An unmapped component still appears, tagged, rather than vanishing
        // silently from the shopping list.
        station: meta?.station ?? "unmapped",
        shopping: meta?.shopping ?? "unmapped",
        prep: meta?.prep,
        dishes: [item],
      });
    }
  }

  return [...byKey.values()].sort(
    (a, b) => b.dishes.length - a.dishes.length || a.key.localeCompare(b.key),
  );
}

/** Components with no entry in kitchen.json — surfaced in the UI as a gap. */
export function unmappedComponents(): UsedComponent[] {
  return usedComponents().filter((c) => c.station === "unmapped");
}

export type Group<T> = { id: string; name: Record<Locale, string>; note?: Record<Locale, string>; entries: T[] };

function group(
  definitions: { id: string; name: Record<Locale, string>; note?: Record<Locale, string> }[],
  pick: (component: UsedComponent) => string,
): Group<UsedComponent>[] {
  const used = usedComponents();
  return definitions
    .map((definition) => ({
      ...definition,
      entries: used.filter((component) => pick(component) === definition.id),
    }))
    .filter((g) => g.entries.length > 0);
}

/** Shopping list, grouped the way someone actually shops. */
export function shoppingList(): Group<UsedComponent>[] {
  return group(kitchen.shoppingCategories, (c) => c.shopping);
}

/** Prep list, grouped by station rather than by dish — how a kitchen works. */
export function prepByStation(): Group<UsedComponent>[] {
  return group(kitchen.stations, (c) => c.station);
}

/** Sauces are just the components the sauce station owns. */
export function sauces(): UsedComponent[] {
  return usedComponents().filter((c) => c.station === "salsa");
}

export const assembly = kitchen.assembly as Record<Locale, string[]>;
export const portions = kitchen.portions as {
  item: Record<Locale, string>;
  amount: string;
}[];

/** Headline counts, so the brief states its own scale. */
export function kitchenStats() {
  const used = usedComponents();
  return {
    dishes: menuItems.length,
    sections: getMenuSections().length,
    components: used.length,
    sauces: used.filter((c) => c.station === "salsa").length,
    singleUse: used.filter((c) => c.dishes.length === 1).length,
  };
}
