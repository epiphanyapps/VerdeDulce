"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { formatShortDate } from "@/lib/format";
import {
  ensureCard,
  listStamps,
  STAMP_GOAL,
  type LoyaltyCard,
  type LoyaltyStamp,
} from "@/lib/loyalty";
import { StampCard } from "../loyalty/StampCard";
import { MemberCode } from "../loyalty/MemberCode";
import { AuthGate } from "./AuthGate";

/**
 * Sells the programme to someone who is not signed in yet.
 *
 * It renders above the Cognito widget rather than in place of it, so the value
 * proposition and the sign-up form are on screen together. The welcome stamp is
 * named explicitly: a card that already has progress on it is a markedly
 * stronger reason to register than an empty one.
 */
function HowItWorks() {
  const t = useTranslations("loyalty");

  return (
    <div className="mb-10">
      <h2 className="font-display text-2xl font-light">{t("howItWorksTitle")}</h2>
      <ol className="mt-4 space-y-3">
        {[t("step1"), t("step2"), t("step3")].map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-semibold text-lime">
              {index + 1}
            </span>
            <span className="text-on-surface-dim">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The headline that turns a row of circles into a reason to come back. */
function Status({ card }: { card: LoyaltyCard }) {
  const t = useTranslations("loyalty");
  const remaining = Math.max(0, STAMP_GOAL - card.stamps);

  if (remaining === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-forest p-6 text-lime sm:p-8">
        <p className="font-display text-3xl font-light sm:text-4xl">{t("rewardReady")}</p>
        <p className="mt-3 text-lime/80">{t("rewardReadyHelp")}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="font-display text-3xl font-light sm:text-4xl">
        {t("remaining", { count: remaining })}
      </p>
      <p className="mt-2 text-on-surface-dim">
        {t("progress", { current: card.stamps, total: STAMP_GOAL })}
      </p>
    </div>
  );
}

/**
 * The audit trail. A bare counter asks the customer to take the number on
 * faith; this is what lets them check that last Tuesday's salad was actually
 * recorded, and is the first thing they will point at if it was not.
 */
function History({ stamps, locale }: { stamps: LoyaltyStamp[]; locale: Locale }) {
  const t = useTranslations("loyalty");

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-light">{t("historyTitle")}</h2>
      {stamps.length === 0 ? (
        <p className="mt-3 text-on-surface-dim">{t("historyEmpty")}</p>
      ) : (
        <ul role="list" className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
          {stamps.map((stamp) => (
            <li key={stamp.id} className="flex items-baseline justify-between gap-4 py-3">
              <span className={stamp.kind === "REDEEMED" ? "font-medium text-forest" : ""}>
                {stamp.kind === "WELCOME"
                  ? t("kindWelcome")
                  : stamp.kind === "REDEEMED"
                    ? t("kindRedeemed")
                    : (stamp.note ?? t("kindEarned"))}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-on-surface-dim">
                {formatShortDate(stamp.createdAt, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LoyaltyBody({ email, signOut }: { email?: string; signOut?: () => void }) {
  const t = useTranslations("loyalty");
  const tAccount = useTranslations("account");
  const locale = useLocale() as Locale;

  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [stamps, setStamps] = useState<LoyaltyStamp[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      // Idempotent, so it doubles as "open a card for a first-time visitor"
      // and "fetch mine" — there is no separate registration step.
      const mine = await ensureCard();
      setCard(mine);
      setStamps(await listStamps(mine.customerSub));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (status === "loading") {
    return <p className="mt-10 text-on-surface-dim">{t("loading")}</p>;
  }

  if (status === "error" || !card) {
    return (
      <div className="mt-10">
        <p className="text-on-surface-dim">{t("error")}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 font-semibold text-forest underline underline-offset-4"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <Status card={card} />
      <StampCard stamps={card.stamps} goal={STAMP_GOAL} />
      <MemberCode code={card.memberCode} />

      {card.rewardsRedeemed > 0 && (
        <p className="mt-6 text-on-surface-dim">
          {t("redeemedCount", { count: card.rewardsRedeemed })}
        </p>
      )}

      <History stamps={stamps} locale={locale} />

      <div className="mt-12 border-t border-border-subtle pt-6 text-sm text-on-surface-dim">
        <p>
          {tAccount("email")}: <span className="font-medium">{email}</span>
        </p>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 underline underline-offset-4 hover:text-forest"
        >
          {tAccount("signOut")}
        </button>
      </div>
    </div>
  );
}

export function LoyaltyPanel() {
  return (
    <AuthGate signedOutHeader={<HowItWorks />}>
      {({ email, signOut }) => <LoyaltyBody email={email} signOut={signOut} />}
    </AuthGate>
  );
}
