/**
 * Site-wide constants. These replace the old `app/config/config.*.ts` trio —
 * there is no `__DEV__` split any more, so anything that genuinely differs per
 * environment belongs in an `NEXT_PUBLIC_*` env var instead.
 */
export const siteConfig = {
  name: "Verde Dulce",
  /** Used for canonical URLs, sitemap, and Open Graph. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://verdedulce.com",
  whatsapp: {
    /** E.164, no `+`, as wa.me expects. */
    phone: "593963021783",
    catalogUrl: "https://wa.me/c/593963021783",
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61564202236840",
    instagram: "https://www.instagram.com/verdedulce_",
  },
  contactEmail: "contact@verdedulce.com",
} as const;

/** Deep-links to WhatsApp with the order message pre-filled. */
export function whatsappOrderUrl(message: string): string {
  return `https://wa.me/${siteConfig.whatsapp.phone}?text=${encodeURIComponent(message)}`;
}
