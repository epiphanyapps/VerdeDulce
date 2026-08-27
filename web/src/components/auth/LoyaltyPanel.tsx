"use client";

import { useTranslations } from "next-intl";
import { AuthGate } from "./AuthGate";

export function LoyaltyPanel() {
  const t = useTranslations("loyalty");
  const tAccount = useTranslations("account");

  return (
    <AuthGate>
      {({ email, signOut }) => (
        <div className="mt-10">
          <p className="text-on-surface-dim">
            {tAccount("email")}: <span className="font-medium">{email}</span>
          </p>

          {/* Nine stamps earned, tenth free — the promotion from adScreen. */}
          <ul role="list" className="mt-8 flex flex-wrap gap-3" aria-label={t("title")}>
            {Array.from({ length: 10 }, (_, index) => (
              <li
                key={index}
                className={`flex size-12 items-center justify-center rounded-full border text-sm font-semibold ${
                  index === 9
                    ? "border-forest bg-forest text-lime"
                    : "border-border-subtle text-on-surface-dim"
                }`}
              >
                {index + 1}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={signOut}
            className="mt-10 text-sm text-on-surface-dim underline underline-offset-4 hover:text-forest"
          >
            {tAccount("signOut")}
          </button>
        </div>
      )}
    </AuthGate>
  );
}
