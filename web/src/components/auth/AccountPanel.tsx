"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthGate } from "./AuthGate";

export function AccountPanel() {
  const t = useTranslations("account");
  const tNav = useTranslations("nav");

  return (
    <AuthGate>
      {({ email, signOut }) => (
        <div className="mt-10">
          <dl className="divide-y divide-border-subtle border-y border-border-subtle">
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-on-surface-dim">{t("email")}</dt>
              <dd className="font-medium">{email}</dd>
            </div>
          </dl>

          <ul role="list" className="mt-8 space-y-2">
            <li>
              <Link
                href="/loyalty"
                className="font-semibold text-forest underline underline-offset-4"
              >
                {tNav("loyalty")}
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="font-semibold text-forest underline underline-offset-4"
              >
                {tNav("settings")}
              </Link>
            </li>
          </ul>

          <button
            type="button"
            onClick={signOut}
            className="mt-10 inline-flex items-center rounded-xl border border-forest px-5 py-3 font-display font-semibold text-forest transition-colors hover:bg-forest hover:text-lime"
          >
            {t("signOut")}
          </button>
        </div>
      )}
    </AuthGate>
  );
}
