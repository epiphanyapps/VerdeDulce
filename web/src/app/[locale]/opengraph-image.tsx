import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Verde Dulce";

/** One card per locale, rendered to PNG at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f2f1e4",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#0b3e35",
              color: "#ebfe72",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            vd
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#0b3e35", fontWeight: 600 }}>
            Verde Dulce
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            lineHeight: 1.1,
            color: "#0e150e",
            maxWidth: 940,
            letterSpacing: -1.5,
          }}
        >
          {t("tagline")}
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "#4a5a4a" }}>
          {locale === "es" ? "Portoviejo · Pide por WhatsApp" : "Portoviejo · Order on WhatsApp"}
        </div>
      </div>
    ),
    size,
  );
}
