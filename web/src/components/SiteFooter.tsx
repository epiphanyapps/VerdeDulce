import QRCode from "qrcode";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";
import { Marquee } from "./Marquee";

/**
 * The QR is rendered to SVG at build time — the RN build drew it on the client
 * with `react-native-qr-svg`, which meant shipping an encoder to every visitor
 * for a value that never changes.
 */
async function qrSvg(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0b3e35", light: "#0000" },
  });
}

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const qr = await qrSvg(siteConfig.whatsapp.catalogUrl);
  // Evaluated at build time, so the copyright year tracks each deploy.
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-sage text-kale">
      <a
        href={siteConfig.whatsapp.catalogUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:underline"
      >
        <Marquee>
          <span className="font-display text-3xl font-normal tracking-tight sm:text-4xl">
            {t("marquee")}
          </span>
        </Marquee>
      </a>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <nav aria-label={tNav("menu")}>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
            {tNav("menu")}
          </h2>
          <ul role="list" className="mt-4 space-y-2 text-sm">
            {(["menu", "loyalty", "gift", "faq", "account"] as const).map((key) => (
              <li key={key}>
                <Link href={`/${key}`} className="hover:underline">
                  {tNav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
            {t("social")}
          </h2>
          <ul role="list" className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {t("instagram")}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {t("facebook")}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.contactEmail}`} className="hover:underline">
                {siteConfig.contactEmail}
              </a>
            </li>
          </ul>

          <p className="mt-6 text-sm">{t("hours")}</p>
          <p className="text-sm">{t("delivery")}</p>
        </div>

        <div className="sm:col-span-2 lg:col-span-1 lg:justify-self-end">
          <a
            href={siteConfig.whatsapp.catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-center"
          >
            <span
              className="block size-32 [&>svg]:size-full"
              // Static, build-time SVG from a constant URL.
              dangerouslySetInnerHTML={{ __html: qr }}
              aria-hidden="true"
            />
            <span className="mt-2 block max-w-32 text-xs text-kale/80">
              {t("scanToOrder")}
            </span>
          </a>
        </div>
      </div>

      <div className="border-t border-kale/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-kale/70 sm:px-6 lg:px-8">
          {t("rights", { year })}
        </p>
      </div>
    </footer>
  );
}
