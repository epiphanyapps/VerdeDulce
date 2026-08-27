import type { ReactNode } from "react";

/**
 * Infinite horizontal ticker. The RN version drove this from an Animated loop
 * on the JS thread; here it is a CSS keyframe translating a duplicated track
 * by -50%, which runs on the compositor and pauses on hover/focus.
 *
 * The duplicate copy is `aria-hidden` so screen readers announce the text once.
 */
export function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="marquee overflow-hidden py-6">
      <div className="marquee-track">
        <span className="shrink-0 pr-12">{children}</span>
        <span className="shrink-0 pr-12" aria-hidden="true">
          {children}
        </span>
      </div>
    </div>
  );
}
