import data from "./menu.json";
import type { Locale } from "@/i18n/routing";

type Localized = Record<Locale, string>;

export type MenuCategory = {
  id: string;
  name: Localized;
};

export type MenuItem = {
  id: string;
  slug: string;
  category: string;
  /**
   * Path under `public/`, or null when we have no photo for this dish yet
   * (MenuImage renders a branded placeholder in that case).
   */
  image: string | null;
  /**
   * Set when a dish was reformulated and the inherited nutrition figures no
   * longer describe what is served. The numbers are shown as approximate
   * rather than removed or invented.
   */
  nutritionEstimated?: boolean;
  /** Cents. */
  price: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  /**
   * False takes the dish off sale: it stops appearing anywhere and cannot be
   * added to an order. Use it when the kitchen runs out. `hidden` is the
   * stronger form — it also drops the item's page from the build entirely.
   */
  available: boolean;
  /** Hidden items are excluded everywhere, including `generateStaticParams`. */
  hidden: boolean;
  name: Localized;
  description: Localized;
};

export type MenuSection = {
  category: MenuCategory;
  items: MenuItem[];
};

const categories = data.categories as MenuCategory[];
const allItems = data.items as MenuItem[];

/**
 * Every item intended to be public, in authored order.
 *
 * `hidden` removes a dish from the site altogether — no page is built for it.
 * `available` is the softer, day-to-day switch: the dish still has a page but
 * is not sold, which is what the kitchen needs when it runs out mid-service.
 */
export const menuItems: MenuItem[] = allItems.filter((item) => !item.hidden);

/** Dishes actually on sale right now. */
export const availableItems: MenuItem[] = menuItems.filter((item) => item.available);

/**
 * The menu grouped for display. Categories with no visible items are dropped so
 * the page never renders an empty section heading.
 */
export function getMenuSections(): MenuSection[] {
  return categories
    .map((category) => ({
      category,
      items: availableItems.filter((item) => item.category === category.id),
    }))
    .filter((section) => section.items.length > 0);
}

export function getMenuItem(slug: string): MenuItem | undefined {
  return menuItems.find((item) => item.slug === slug);
}

export function getCategory(id: string): MenuCategory | undefined {
  return categories.find((category) => category.id === id);
}

/** Items in the same category, excluding the one being viewed. */
export function getRelatedItems(item: MenuItem, limit = 3): MenuItem[] {
  return menuItems
    .filter((other) => other.category === item.category && other.slug !== item.slug)
    .slice(0, limit);
}
