import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/pageMetadata";
import { PageShell } from "@/components/PageShell";
import { LoginPanel } from "@/components/auth/LoginPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...(await pageMetadata(locale, "login", "/login")),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <PageShell title={t("signIn")}>
      <LoginPanel />
    </PageShell>
  );
}
