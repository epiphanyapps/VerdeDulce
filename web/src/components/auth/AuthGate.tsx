"use client";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import "@aws-amplify/ui-react/styles.css";
import { amplifyConfigured } from "./AmplifyProvider";

/**
 * Wraps an authenticated surface in the hosted Amplify Authenticator, which
 * replaces the hand-rolled 630-line `LoginScreen.tsx` — Cognito sign-in,
 * sign-up, confirmation codes and password reset all come from the library.
 *
 * Auth runs entirely client-side, so these pages are still statically exported;
 * they simply render their signed-out state in the HTML.
 */
export function AuthGate({
  children,
}: {
  children: (props: { email?: string; signOut?: () => void }) => ReactNode;
}) {
  const t = useTranslations("common");

  if (!amplifyConfigured()) {
    return <p className="py-12 text-on-surface-dim">{t("error")}</p>;
  }

  return (
    <Authenticator.Provider>
      <Authenticator loginMechanisms={["email"]} signUpAttributes={["email"]}>
        {() => <AuthedChildren>{children}</AuthedChildren>}
      </Authenticator>
    </Authenticator.Provider>
  );
}

function AuthedChildren({
  children,
}: {
  children: (props: { email?: string; signOut?: () => void }) => ReactNode;
}) {
  const { user, signOut } = useAuthenticator((context) => [
    context.user,
    context.signOut,
  ]);

  return <>{children({ email: user?.signInDetails?.loginId, signOut })}</>;
}
