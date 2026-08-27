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
  /** Cents. */
  price: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
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

/** Every item intended to be public, in authored order. */
export const menuItems: MenuItem[] = allItems.filter((item) => !item.hidden);

/**
 * The menu grouped for display. Categories with no visible items are dropped so
 * the page never renders an empty section heading.
 */
export function getMenuSections(): MenuSection[] {
  return categories
    .map((category) => ({
      category,
      items: menuItems.filter((item) => item.category === category.id),
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
