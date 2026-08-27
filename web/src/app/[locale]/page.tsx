import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMenuSections } from "@/content/menu";
import type { Locale } from "@/i18n/routing";
import { whatsappOrderUrl } from "@/lib/config";
import { MenuGrid } from "@/components/MenuGrid";
import { CTAAnchor, CTALink, ArrowIcon } from "@/components/CTALink";

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
