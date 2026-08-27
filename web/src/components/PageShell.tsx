import type { ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  children,
  width = "prose",
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  width?: "prose" | "wide";
}) {
  return (
    <div
      className={`mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 ${
        width === "wide" ? "max-w-7xl" : "max-w-3xl"
      }`}
    >
      <h1 className="font-display text-4xl font-light tracking-tight sm:text-5xl">
        {title}
      </h1>
      {subtitle && <p className="mt-4 text-lg text-on-surface-dim">{subtitle}</p>}
      {children}
    </div>
  );
}
