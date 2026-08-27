import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/routing";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-display text-base font-semibold " +
  "transition-colors duration-200 motion-reduce:transition-none";

const variants = {
  /** The primary order button — forest fill, lime text, inverting on hover. */
  primary:
    "border border-cream bg-forest text-lime hover:border-forest hover:bg-cream hover:text-forest",
  /** Outlined, for secondary actions sitting next to a primary. */
  secondary:
    "border border-forest bg-transparent text-forest hover:bg-forest hover:text-lime",
} as const;

type Variant = keyof typeof variants;

function classes(variant: Variant, className?: string) {
  return `${base} ${variants[variant]} ${className ?? ""}`.trim();
}

/** Internal, locale-aware CTA. */
export function CTALink({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={classes(variant, className)} {...props}>
      {children}
    </Link>
  );
}

/**
 * External CTA — used for the WhatsApp catalog, which leaves the site.
 * `rel="noopener"` is set because these all open in a new tab.
 */
export function CTAAnchor({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; children: ReactNode }) {
  return (
    <a
      className={classes(variant, className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}

/** The right-pointing chevron the RN OrderButton drew with an Ionicon. */
export function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
