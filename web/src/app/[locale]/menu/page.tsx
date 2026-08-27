import type { Metadata } from "next";
import { ogImage } from "@/lib/pageMetadata";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMenuSections } from "@/content/menu";
import type { Locale } from "@/i18n/routing";
import { MenuGrid } from "@/components/MenuGrid";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.menu" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: { images: ogImage(locale) },
    alternates: {
      canonical: `/${locale}/menu`,
      languages: { es: "/es/menu", en: "/en/menu", "x-default": "/es/menu" },
    },
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("menu");
  const sections = getMenuSections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-light tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-on-surface-dim">{t("intro")}</p>
      </header>

      {sections.length > 1 && (
        <nav aria-label={t("jumpTo")} className="mt-8">
          <ul role="list" className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <li key={section.category.id}>
                <a
                  href={`#${section.category.id}`}
                  className="inline-block rounded-full border border-border-subtle px-4 py-1.5 text-sm transition-colors hover:border-forest hover:text-forest"
                >
                  {section.category.name[locale]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-14">
        {sections.length > 0 ? (
          <MenuGrid sections={sections} locale={locale} />
        ) : (
          <p className="text-on-surface-dim">{t("empty")}</p>
        )}
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Menu",
          name: t("title"),
          url: `${siteConfig.url}/${locale}/menu/`,
          inLanguage: locale,
          // Ties the menu back to the Restaurant node declared in the layout.
          provider: { "@id": `${siteConfig.url}/#restaurant` },
          hasMenuSection: sections.map((section) => ({
            "@type": "MenuSection",
            name: section.category.name[locale],
            hasMenuItem: section.items.map((item) => ({
              "@type": "MenuItem",
              name: item.name[locale],
              description: item.description[locale],
              url: `${siteConfig.url}/${locale}/menu/${item.slug}/`,
              offers: {
                "@type": "Offer",
                price: (item.price / 100).toFixed(2),
                priceCurrency: "USD",
              },
            })),
          })),
        }}
      />
    </div>
  );
}
