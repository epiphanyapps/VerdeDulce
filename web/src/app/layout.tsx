import type { ReactNode } from "react";

/**
 * Pass-through root layout. The real `<html>`/`<body>` live in
 * `[locale]/layout.tsx`, which is the only place that knows the language to
 * put on the `lang` attribute.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
