import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/pageMetadata";
import { PageShell } from "@/components/PageShell";
import { AccountPanel } from "@/components/auth/AccountPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...(await pageMetadata(locale, "account", "/account")),
    robots: { index: false, follow: true },
  };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  return (
    <PageShell title={t("title")}>
      <AccountPanel />
    </PageShell>
  );
}
