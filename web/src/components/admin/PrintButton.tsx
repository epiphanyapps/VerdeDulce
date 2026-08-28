"use client";

/**
 * A laminated sheet beats a phone with wet hands, so the brief is built to
 * print. Hidden from the printed output itself.
 */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-6 inline-flex items-center gap-2 rounded-xl border border-forest px-4 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-lime print:hidden"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-4">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
      </svg>
      {label}
    </button>
  );
}
