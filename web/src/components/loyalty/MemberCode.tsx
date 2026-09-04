"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { siteConfig } from "@/lib/config";

/**
 * The member code, and the QR that carries it.
 *
 * This is the piece the page exists for at the counter: it is what identifies
 * the customer to staff. The QR deep-links into the admin punch tool with the
 * code already filled, so a phone camera is enough — staff never have to type
 * it. The printed code below is the fallback for a cracked lens or a scanner
 * that will not focus.
 *
 * Unlike the footer QR, this one cannot be built ahead of time: the value is
 * per-customer, so the encoder runs in the browser.
 */
export function MemberCode({ code }: { code: string }) {
  const t = useTranslations("loyalty");
  const locale = useLocale();
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const target = `${siteConfig.url}/${locale}/admin/?code=${encodeURIComponent(code)}`;

    // Imported lazily so the ~40 kB encoder is not in the bundle for visitors
    // who never open a signed-in page.
    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(target, {
          margin: 1,
          width: 320,
          errorCorrectionLevel: "M",
          color: { dark: "#0b3e35", light: "#eae8d8" },
        }),
      )
      .then((dataUrl) => {
        if (!cancelled) setQrSrc(dataUrl);
      })
      // The code itself is readable without the QR, so a failed encode
      // degrades rather than breaking the page.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [code, locale]);

  return (
    <div className="mt-10 rounded-2xl border border-border-subtle bg-surface-muted p-6 sm:flex sm:items-center sm:gap-8">
      {/*
        A plain <img> rather than next/image: the source is a data URI produced
        in the browser, so there is nothing for the image optimizer to fetch or
        for the static export to emit. Sized in both attributes and CSS so the
        card does not reflow when the encode resolves.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrSrc ?? undefined}
        alt=""
        width={160}
        height={160}
        className="mx-auto size-40 shrink-0 rounded-lg"
      />
      <div className="mt-6 text-center sm:mt-0 sm:text-left">
        <p className="text-sm text-on-surface-dim">{t("yourCode")}</p>
        <p className="mt-1 font-display text-4xl font-semibold tracking-[0.2em] text-forest">
          {code}
        </p>
        <p className="mt-3 max-w-xs text-sm text-on-surface-dim">{t("showAtCounter")}</p>
      </div>
    </div>
  );
}
