"use client";

import { useState } from "react";
import { uploadData } from "aws-amplify/storage";
import { useTranslations } from "next-intl";

/**
 * Uploads menu photography to the `menu-pictures/` prefix — the write half of
 * the storage rule in `amplify/storage/resource.ts`, replacing the RN
 * `CreateItem`/`AdminScreen` pair.
 *
 * Note this only puts the image in the bucket. Menu copy, pricing and nutrition
 * still live in `src/content/menu.json` and ship with a build, so adding a dish
 * remains a code change until the menu moves to a real datastore.
 */
export function MenuUploader() {
  const t = useTranslations("common");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = new FormData(form).get("file");
    if (!(file instanceof File) || file.size === 0) return;

    setBusy(true);
    setStatus(null);

    try {
      await uploadData({
        path: `menu-pictures/${file.name}`,
        data: file,
        options: { contentType: file.type },
      }).result;
      setStatus(`menu-pictures/${file.name}`);
      form.reset();
    } catch {
      setStatus(t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 max-w-md">
      <label
        htmlFor="menu-image"
        className="block font-display text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-dim"
      >
        menu-pictures/
      </label>
      <input
        id="menu-image"
        name="file"
        type="file"
        accept="image/*"
        required
        className="mt-3 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-lime"
      />
      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex items-center rounded-xl border border-forest px-5 py-3 font-display font-semibold text-forest transition-colors hover:bg-forest hover:text-lime disabled:opacity-50"
      >
        {busy ? t("loading") : "Upload"}
      </button>
      {status && <p className="mt-4 text-sm text-on-surface-dim">{status}</p>}
    </form>
  );
}
