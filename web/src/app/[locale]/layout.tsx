import type { Metadata } from "next";
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
      url: `/${locale}`,
    },
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
            name: siteConfig.name,
            url: `${siteConfig.url}/${locale}`,
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
