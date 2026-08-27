import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getMenuItem, getCategory, menuItems } from "@/content/menu";
import { routing, type Locale } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Verde Dulce";

/** A card per dish per locale, rendered to PNG at build time. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    menuItems.map((item) => ({ locale, slug: item.slug })),
  );
}

/**
 * Reads the dish photo off disk rather than fetching it. A static export has no
 * server to fetch from at build time, and these files are local anyway.
 */
async function loadPhoto(image: string | null): Promise<string | null> {
  if (!image) return null;
  try {
    const bytes = await readFile(join(process.cwd(), "public", image));
    const mime = image.endsWith(".jpg") || image.endsWith(".jpeg")
      ? "image/jpeg"
      : "image/png";
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function ItemOpengraphImage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = getMenuItem(slug);
  if (!item) return new ImageResponse(<div />, size);

  const photo = await loadPhoto(item.image);
  const category = getCategory(item.category);
  const price = (item.price / 100).toFixed(2);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f2f1e4" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 70,
          }}
        >
          {category && (
            <div style={{ display: "flex", fontSize: 24, color: "#4a5a4a", letterSpacing: 3, marginBottom: 18 }}>
              {category.name[locale].toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 60, lineHeight: 1.08, color: "#0e150e", letterSpacing: -1 }}>
            {item.name[locale]}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#0b3e35", marginTop: 24 }}>
            {`$${price} · ${item.nutrition.calories} CAL`}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 48 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "#0b3e35",
                color: "#ebfe72",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              vd
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "#0b3e35" }}>Verde Dulce</div>
          </div>
        </div>

        {/* With no photograph there is nothing to put in the right panel, and
            repeating the dish name there just reads as a rendering fault — so
            the text column takes the full width instead. */}
        {photo && (
          <div
            style={{
              width: 470,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#eae8d8",
            }}
          >
            <img src={photo} width={470} height={630} style={{ objectFit: "cover" }} alt="" />
          </div>
        )}
      </div>
    ),
    size,
  );
}
