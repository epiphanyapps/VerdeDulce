"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { AuthGate } from "./AuthGate";

/** Signing in here lands on the account page; the gate handles everything else. */
export function LoginPanel() {
  const router = useRouter();
  const t = useTranslations("common");

  return (
    <AuthGate>
      {({ email }) => {
        if (email) router.replace("/account");
        return <p className="mt-10 text-on-surface-dim">{t("loading")}</p>;
      }}
    </AuthGate>
  );
}
