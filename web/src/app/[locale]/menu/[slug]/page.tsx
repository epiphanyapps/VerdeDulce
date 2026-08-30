import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMenuItem, getRelatedItems, getCategory, menuItems } from "@/content/menu";
import { Link, routing, type Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/format";
import { siteConfig, whatsappOrderUrl } from "@/lib/config";
import { CTAAnchor, ArrowIcon } from "@/components/CTALink";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { NutritionBullets } from "@/components/NutritionBullets";
import { MenuCard } from "@/components/MenuCard";
import { MenuImage } from "@/components/MenuImage";
import { JsonLd } from "@/components/JsonLd";

/** One static page per visible item, per locale. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    menuItems.map((item) => ({ locale, slug: item.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getMenuItem(slug);
  if (!item) return {};

  const name = item.name[locale];
  const description = item.description[locale];

  return {
    title: name,
    description,
    alternates: {
      canonical: `/${locale}/menu/${slug}`,
      languages: {
        es: `/es/menu/${slug}`,
        en: `/en/menu/${slug}`,
        "x-default": `/es/menu/${slug}`,
      },
    },
    openGraph: {
      title: name,
      description,
      type: "article",
      // The colocated opengraph-image.tsx renders a branded 1200x630 card for
      // every dish, including those with no photograph. This points at the .png
      // sibling written by scripts/emit-og-png.mjs — the bare convention URL is
      // extensionless, which Amplify 301s into a 404.
      images: [
        {
          url: `${siteConfig.url}/${locale}/menu/${slug}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
  };
}

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = getMenuItem(slug);
  if (!item) notFound();

  const t = await getTranslations("menu");
  const tn = await getTranslations("nutrition");

  const name = item.name[locale];
  const description = item.description[locale];
  const price = formatPrice(item.price, locale);
  const category = getCategory(item.category);
  const related = getRelatedItems(item);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-dim transition-colors hover:text-forest"
        >
          <span aria-hidden="true">←</span>
          {t("backToMenu")}
        </Link>
      </nav>

      <article className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-muted">
          <MenuImage
            item={item}
            locale={locale}
            sizes="(min-width: 64rem) 42rem, 92vw"
            priority
          />
        </div>

        <div className="flex flex-col">
          {category && (
            <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-dim">
              {category.name[locale]}
            </p>
          )}

          <h1 className="mt-3 font-display text-3xl font-light leading-tight tracking-tight sm:text-4xl">
            {name}
          </h1>

          <p className="mt-3 font-display text-xl font-light">
            {price}
            <span aria-hidden="true"> · </span>
            <span>
              {item.nutrition.calories} {tn("shortCalories")}
            </span>
          </p>

          <p className="mt-6 text-lg leading-relaxed text-on-surface-dim">
            {description}
          </p>

          <section aria-labelledby="nutrition-heading" className="mt-10">
            <h2
              id="nutrition-heading"
              className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-dim"
            >
              {tn("perServing")}
            </h2>
            {item.nutritionEstimated && (
              // The dish was reformulated; the inherited figures are close but
              // no longer exact. Saying so beats printing them as fact.
              <p className="mt-1 text-sm text-on-surface-dim">{tn("approximate")}</p>
            )}
            <NutritionBullets nutrition={item.nutrition} className="mt-4" />
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <CTAAnchor
              href={whatsappOrderUrl(t("orderItemMessage", { item: name }))}
            >
              {t("orderOnWhatsapp")}
              <ArrowIcon />
            </CTAAnchor>
            <AddToCartButton slug={item.slug} available={item.available} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-24">
          <h2
            id="related-heading"
            className="mb-6 font-display text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-dim"
          >
            {t("relatedTitle")}
          </h2>
          <ul
            role="list"
            className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10"
          >
            {related.map((other) => (
              <li key={other.slug} className="flex">
                <MenuCard item={other} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: siteConfig.name, item: `${siteConfig.url}/${locale}/` },
            { "@type": "ListItem", position: 2, name: t("title"), item: `${siteConfig.url}/${locale}/menu/` },
            ...(category
              ? [{ "@type": "ListItem", position: 3, name: category.name[locale] }]
              : []),
            { "@type": "ListItem", position: category ? 4 : 3, name },
          ],
        }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MenuItem",
          name,
          description,
          ...(item.image ? { image: `${siteConfig.url}${item.image}` } : {}),
          url: `${siteConfig.url}/${locale}/menu/${item.slug}`,
          offers: {
            "@type": "Offer",
            price: (item.price / 100).toFixed(2),
            priceCurrency: "USD",
            availability: item.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
          nutrition: {
            "@type": "NutritionInformation",
            calories: `${item.nutrition.calories} calories`,
            proteinContent: `${item.nutrition.protein} g`,
            fatContent: `${item.nutrition.fat} g`,
            carbohydrateContent: `${item.nutrition.carbs} g`,
          },
        }}
      />
    </div>
  );
}
