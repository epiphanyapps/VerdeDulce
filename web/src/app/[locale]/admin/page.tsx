import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/pageMetadata";
import { PageShell } from "@/components/PageShell";
import { AdminPanel } from "@/components/auth/AdminPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...(await pageMetadata(locale, "admin", "/admin")),
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <PageShell title={t("title")} subtitle={t("subtitle")}>
      <AdminPanel />
    </PageShell>
  );
}
