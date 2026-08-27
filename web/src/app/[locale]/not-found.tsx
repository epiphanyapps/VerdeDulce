import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { PageShell } from "@/components/PageShell";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <PageShell title={t("title")} subtitle={t("description")}>
      <Link
        href="/"
        className="mt-8 inline-block font-semibold text-forest underline underline-offset-4"
      >
        {t("backHome")}
      </Link>
    </PageShell>
  );
}
