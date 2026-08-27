import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Open_Sans, Poppins } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartProvider } from "@/components/cart/CartProvider";
import { JsonLd } from "@/components/JsonLd";
import "../globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f1e4" },
    { media: "(prefers-color-scheme: dark)", color: "#0b3e35" },
  ],
  colorScheme: "light",
};

/** Enumerates `/es` and `/en` so both trees are emitted by the static export. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("home.title"),
      template: `%s · ${t("siteName")}`,
    },
    description: t("home.description"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
        // Tells search engines which version to serve when no locale matches.
        "x-default": "/es",
      },
    },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      locale: locale === "es" ? "es_EC" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_EC"],
      url: `/${locale}`,
      // Explicit .png URL rather than the bare opengraph-image convention:
      // scripts/emit-og-png.mjs writes that sibling, and the extension is what
      // makes Amplify serve it as an image instead of 301-ing it into a 404.
      images: [
        {
          url: `${siteConfig.url}/${locale}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
    // Surfaced by Google as the site name in results rather than the domain.
    applicationName: t("siteName"),
    category: "restaurant",
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for static rendering — without it next-intl opts the whole
  // subtree into dynamic rendering, which a static export cannot produce.
  setRequestLocale(locale);

  const t = await getTranslations("nav");

  return (
    <html lang={locale} className={`${poppins.variable} ${openSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <CartProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-forest focus:px-4 focus:py-2 focus:text-lime"
            >
              {t("skipToContent")}
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </CartProvider>
        </NextIntlClientProvider>

        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "@id": `${siteConfig.url}/#restaurant`,
            name: siteConfig.name,
            url: `${siteConfig.url}/${locale}`,
            image: `${siteConfig.url}/icon.png`,
            hasMenu: `${siteConfig.url}/${locale}/menu/`,
            // Stated on the FAQ page; repeated here so search engines can read it.
            paymentAccepted: locale === "es" ? "Efectivo, transferencia bancaria" : "Cash, bank transfer",
            currenciesAccepted: "USD",
            areaServed: ["Portoviejo", "12 de Marzo", "18 de Octubre", "Andrés de Vera"],
            servesCuisine: locale === "es" ? "Saludable" : "Healthy",
            priceRange: "$",
            email: siteConfig.contactEmail,
            telephone: `+${siteConfig.whatsapp.phone}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Portoviejo",
              addressRegion: "Manabí",
              addressCountry: "EC",
            },
            sameAs: [siteConfig.social.instagram, siteConfig.social.facebook],
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ],
              opens: "11:00",
              closes: "19:00",
            },
          }}
        />
      </body>
    </html>
  );
}
