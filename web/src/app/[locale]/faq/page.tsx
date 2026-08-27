import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import faq from "@/content/faq.json";
import type { Locale } from "@/i18n/routing";
import { whatsappOrderUrl } from "@/lib/config";
import { CTAAnchor, ArrowIcon } from "@/components/CTALink";
import { JsonLd } from "@/components/JsonLd";

type FaqEntry = {
  id: string;
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
};

const entries = faq as FaqEntry[];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.faq" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/faq`,
      languages: { es: "/es/faq", en: "/en/faq", "x-default": "/es/faq" },
    },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faq");
  const tHome = await getTranslations("home");
  const tMenu = await getTranslations("menu");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="font-display text-4xl font-light tracking-tight sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 text-lg text-on-surface-dim">{t("intro")}</p>

      {/* <details> gives working disclosure behaviour with no JavaScript, and
          the answers stay in the HTML for crawlers either way. */}
      <div className="mt-12 divide-y divide-border-subtle border-y border-border-subtle">
        {entries.map((entry) => (
          <details key={entry.id} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium">
              <h2 className="inline text-lg font-medium">{entry.question[locale]}</h2>
              <span
                aria-hidden="true"
                className="shrink-0 text-2xl leading-none text-forest transition-transform group-open:rotate-45 motion-reduce:transition-none"
              >
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-on-surface-dim">
              {entry.answer[locale]}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-12">
        <CTAAnchor href={whatsappOrderUrl(tMenu("orderMessage"))}>
          {tHome("orderNow")}
          <ArrowIcon />
        </CTAAnchor>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: entries.map((entry) => ({
            "@type": "Question",
            name: entry.question[locale],
            acceptedAnswer: {
              "@type": "Answer",
              text: entry.answer[locale],
            },
          })),
        }}
      />
    </div>
  );
}
