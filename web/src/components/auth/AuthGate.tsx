"use client";

import {
  Authenticator,
  ThemeProvider,
  translations,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import { I18n } from "aws-amplify/utils";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import "@aws-amplify/ui-react/styles.css";
import { amplifyConfigured } from "./AmplifyProvider";
import { authTheme } from "./authTheme";

/**
 * Amplify ships translations for every string the Authenticator renders, but
 * they are opt-in — without registering them the widget stays in English even
 * on the Spanish routes. Registered at module scope so the vocabulary exists
 * before the first render.
 */
I18n.putVocabularies(translations);

/** A few overrides where Amplify's wording does not match the site's voice. */
I18n.putVocabulariesForLanguage("es", {
  "Sign In": "Iniciar sesión",
  "Create Account": "Crear cuenta",
  "Forgot your password?": "¿Olvidaste tu contraseña?",
  // Amplify's own Spanish leaves these two in English.
  Email: "Correo electrónico",
  "Enter your Email": "Tu correo electrónico",
  "Enter your Password": "Tu contraseña",
  "Confirm Password": "Confirma tu contraseña",
  "Please confirm your Password": "Confirma tu contraseña",
});

/**
 * Wraps an authenticated surface in the Amplify Authenticator, which replaces
 * the hand-rolled LoginScreen from the Expo app — Cognito sign-in, sign-up,
 * confirmation codes and password reset all come from the library.
 *
 * Auth runs entirely client-side, so these pages are still statically
 * exported; they render their signed-out state in the HTML.
 */
export function AuthGate({
  children,
}: {
  children: (props: { email?: string; signOut?: () => void }) => ReactNode;
}) {
  const t = useTranslations("common");
  const locale = useLocale();

  // Set during render rather than in an effect: Amplify keeps the active
  // language in module state, and an effect runs after the first paint, so the
  // widget would render in English and then swap to Spanish. The call is
  // idempotent, so doing it on every render is harmless.
  I18n.setLanguage(locale);

  if (!amplifyConfigured()) {
    return <p className="py-12 text-on-surface-dim">{t("error")}</p>;
  }

  return (
    <ThemeProvider theme={authTheme}>
      <Authenticator.Provider>
        <Authenticator loginMechanisms={["email"]} signUpAttributes={["email"]}>
          {() => <AuthedChildren>{children}</AuthedChildren>}
        </Authenticator>
      </Authenticator.Provider>
    </ThemeProvider>
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
