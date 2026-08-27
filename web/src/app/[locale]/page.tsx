import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ogImage } from "@/lib/pageMetadata";
import { getMenuSections } from "@/content/menu";
import type { Locale } from "@/i18n/routing";
import { whatsappOrderUrl } from "@/lib/config";
import { MenuGrid } from "@/components/MenuGrid";
import { CTAAnchor, CTALink, ArrowIcon } from "@/components/CTALink";

/**
 * Only declares the OG image: title, description and canonical are inherited
 * from the locale layout, which is correct for the site root. The image has to
 * be restated here because the file convention would otherwise win.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { openGraph: { images: ogImage(locale) } };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tMenu = await getTranslations("menu");
  const sections = getMenuSections();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="py-16 text-center sm:py-24">
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          {t("tagline")}
        </h1>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <CTAAnchor href={whatsappOrderUrl(tMenu("orderMessage"))}>
            {t("orderNow")}
            <ArrowIcon />
          </CTAAnchor>
          <CTALink href="/menu" variant="secondary">
            {t("viewMenu")}
          </CTALink>
        </div>
      </section>

      <MenuGrid sections={sections} locale={locale} />
    </div>
  );
}
