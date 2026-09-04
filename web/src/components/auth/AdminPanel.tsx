"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { AuthGate } from "./AuthGate";
import { MenuUploader } from "./MenuUploader";
import { LoyaltyPunch } from "../admin/LoyaltyPunch";

/**
 * Group membership is read from the Cognito ID token. This is a UI affordance
 * only — the authoritative check is the S3 bucket policy in
 * `amplify/storage/resource.ts`, which is what actually rejects a write from a
 * non-admin identity.
 */
function useIsAdmin() {
  const [state, setState] = useState<"loading" | "admin" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;

    fetchAuthSession()
      .then((session) => {
        const groups = session.tokens?.idToken?.payload["cognito:groups"];
        const isAdmin =
          Array.isArray(groups) && groups.some((g) => g === "ADMINS" || g === "EDITORS");
        if (!cancelled) setState(isAdmin ? "admin" : "denied");
      })
      .catch(() => {
        if (!cancelled) setState("denied");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function AdminBody({ email, guide }: { email?: string; guide: ReactNode }) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tLoyalty = useTranslations("loyaltyPunch");
  const state = useIsAdmin();

  if (state === "loading") {
    return <p className="mt-10 text-on-surface-dim">{tCommon("loading")}</p>;
  }

  if (state === "denied") {
    return <p className="mt-10 text-on-surface-dim">{t("restricted")}</p>;
  }

  return (
    <>
      {email && (
        <p className="mt-8 text-sm text-on-surface-dim print:hidden">
          {t("signedInAs")} <span className="font-medium">{email}</span>
        </p>
      )}

      {/* The guide is rendered on the server and passed through, so the whole
          brief is static HTML and does not wait on the auth round-trip. */}
      {guide}

      <section className="mt-16 border-t border-border-subtle pt-8 print:hidden">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-dim">
          {tLoyalty("title")}
        </h2>
        <p className="mt-1 text-sm text-on-surface-dim">{tLoyalty("hint")}</p>
        <LoyaltyPunch />
      </section>

      <section className="mt-16 border-t border-border-subtle pt-8 print:hidden">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-dim">
          {t("uploads")}
        </h2>
        <p className="mt-1 text-sm text-on-surface-dim">{t("uploadsHint")}</p>
        <MenuUploader />
      </section>
    </>
  );
}

export function AdminPanel({ guide }: { guide: ReactNode }) {
  return (
    <AuthGate>
      {({ email }) => <AdminBody email={email} guide={guide} />}
    </AuthGate>
  );
}
