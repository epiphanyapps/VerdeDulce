import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export const dynamic = "force-static";

/**
 * A single manifest at the app root rather than one per locale — the manifest
 * convention does not resolve inside a dynamic segment, and a web app manifest
 * is a per-origin document anyway. `start_url` points at the default locale;
 * the site itself still serves both.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Verde Dulce",
    short_name: "Verde Dulce",
    description:
      "Ensaladas, tazones de granos y platos de temporada hechos con ingredientes locales.",
    start_url: `/${routing.defaultLocale}/`,
    scope: "/",
    display: "standalone",
    background_color: "#f2f1e4",
    theme_color: "#0b3e35",
    lang: routing.defaultLocale,
    icons: [
      { src: "/icon.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "1024x1024", type: "image/png" },
    ],
  };
}
