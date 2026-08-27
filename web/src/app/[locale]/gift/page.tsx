import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/pageMetadata";
import { PageShell } from "@/components/PageShell";
import { CTAAnchor, ArrowIcon } from "@/components/CTALink";
import { whatsappOrderUrl } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "gift", "/gift");
}

export default async function GiftPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gift");
  const tMenu = await getTranslations("menu");

  return (
    <PageShell title={t("title")} subtitle={t("subtitle")}>
      <p className="mt-8 text-on-surface-dim">{t("notify")}</p>
      <div className="mt-8">
        <CTAAnchor href={whatsappOrderUrl(tMenu("orderMessage"))}>
          WhatsApp
          <ArrowIcon />
        </CTAAnchor>
      </div>
    </PageShell>
  );
}
