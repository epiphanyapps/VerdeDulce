import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/pageMetadata";
import { PageShell } from "@/components/PageShell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...(await pageMetadata(locale, "settings", "/settings")),
    robots: { index: false, follow: true },
  };
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <PageShell title={t("title")}>
      <section className="mt-10">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-dim">
          {t("language")}
        </h2>
        <LanguageSwitcher className="mt-4" />
      </section>
    </PageShell>
  );
}
