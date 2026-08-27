import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

/** Required under `output: "export"` — emits the file at build time instead of
 * treating the route as a dynamic handler. */
export const dynamic = "force-static";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal and auth-gated surfaces — no value in the index, and the
      // cart/account pages differ per visitor.
      disallow: ["/es/cart/", "/en/cart/", "/es/account/", "/en/account/",
                 "/es/settings/", "/en/settings/", "/es/login/", "/en/login/",
                 "/es/admin/", "/en/admin/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
