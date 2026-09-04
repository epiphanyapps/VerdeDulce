"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  findCardByCode,
  normalizeMemberCode,
  punchCard,
  redeemReward,
  STAMP_GOAL,
  type LoyaltyCard,
} from "@/lib/loyalty";

type Feedback = { tone: "ok" | "bad"; text: string } | null;

/**
 * The counter-side half of the loyalty programme: look a customer up by the
 * code on their phone, add a stamp, or hand over the free salad.
 *
 * Every button here calls a Lambda-backed mutation. Nothing on this screen
 * writes to the models directly — staff hold ADMINS/EDITORS, which is granted
 * read access only, so a compromised staff session cannot rewrite a card's
 * history either.
 */
export function LoyaltyPunch() {
  const t = useTranslations("loyaltyPunch");

  const [code, setCode] = useState("");
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  /**
   * The customer's QR points at this page with `?code=` set, so scanning it
   * with a phone camera fills the field. Read straight off `window.location`
   * rather than through `useSearchParams`, which would force this subtree into
   * a Suspense boundary and opt the statically exported page into client-side
   * rendering.
   */
  useEffect(() => {
    const fromQr = new URLSearchParams(window.location.search).get("code");
    if (fromQr) setCode(normalizeMemberCode(fromQr));
  }, []);

  async function act<T>(work: () => Promise<T>, onOk: (result: T) => Feedback) {
    setBusy(true);
    setFeedback(null);
    try {
      setFeedback(onOk(await work()));
    } catch (error) {
      setFeedback({ tone: "bad", text: error instanceof Error ? error.message : t("error") });
    } finally {
      setBusy(false);
    }
  }

  const lookup = () =>
    act(
      () => findCardByCode(normalizeMemberCode(code)),
      (found) => {
        setCard(found);
        return found ? null : { tone: "bad", text: t("notFound") };
      },
    );

  const addStamp = () =>
    act(
      () => punchCard(normalizeMemberCode(code)),
      (updated) => {
        setCard(updated);
        return { tone: "ok", text: t("punched") };
      },
    );

  const give = () =>
    act(
      () => redeemReward(normalizeMemberCode(code)),
      (updated) => {
        setCard(updated);
        return { tone: "ok", text: t("redeemed") };
      },
    );

  const ready = card !== null && card.stamps >= STAMP_GOAL;

  return (
    <div className="mt-4 max-w-md">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label htmlFor="member-code" className="block text-sm text-on-surface-dim">
            {t("codeLabel")}
          </label>
          <input
            id="member-code"
            value={code}
            onChange={(event) => setCode(normalizeMemberCode(event.target.value))}
            // The alphabet has no lowercase, so uppercase input avoids a
            // pointless mismatch when staff type it in a hurry.
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={6}
            className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 font-display text-xl tracking-[0.2em] uppercase"
          />
        </div>
        <button
          type="button"
          onClick={() => void lookup()}
          disabled={busy || code.length < 6}
          className="rounded-lg border border-forest px-4 py-2 font-semibold text-forest disabled:opacity-40"
        >
          {t("lookup")}
        </button>
      </div>

      {card && (
        <div className="mt-6 rounded-xl border border-border-subtle p-4">
          <p className="text-sm text-on-surface-dim">
            {t("cardFor", { email: card.email ?? "—" })}
          </p>
          <p className="mt-1 font-display text-2xl">
            {t("stampsLine", { stamps: card.stamps, goal: STAMP_GOAL })}
          </p>
          {ready && (
            <p className="mt-2 inline-block rounded-full bg-lime px-3 py-1 text-sm font-semibold text-forest">
              {t("readyBadge")}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void addStamp()}
              disabled={busy || ready}
              className="rounded-lg bg-forest px-4 py-2 font-semibold text-lime disabled:opacity-40"
            >
              {t("addStamp")}
            </button>
            <button
              type="button"
              onClick={() => void give()}
              disabled={busy || !ready}
              className="rounded-lg border border-forest px-4 py-2 font-semibold text-forest disabled:opacity-40"
            >
              {t("redeem")}
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p
          role="status"
          className={`mt-4 text-sm ${feedback.tone === "ok" ? "text-forest" : "text-angry"}`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
