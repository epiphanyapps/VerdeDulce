import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "es",
  // Every URL carries its locale. With a static export there is no middleware
  // to negotiate an unprefixed root, so an explicit prefix keeps one canonical
  // URL per page and makes the hreflang pairs unambiguous.
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
