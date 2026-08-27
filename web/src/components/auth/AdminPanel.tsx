"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useTranslations } from "next-intl";
import { AuthGate } from "./AuthGate";
import { MenuUploader } from "./MenuUploader";

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

function AdminBody() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const state = useIsAdmin();

  if (state === "loading") {
    return <p className="mt-10 text-on-surface-dim">{tCommon("loading")}</p>;
  }

  if (state === "denied") {
    return <p className="mt-10 text-on-surface-dim">{t("restricted")}</p>;
  }

  return <MenuUploader />;
}

export function AdminPanel() {
  return <AuthGate>{() => <AdminBody />}</AuthGate>;
}
