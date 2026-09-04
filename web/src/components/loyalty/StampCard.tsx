import { useTranslations } from "next-intl";

/**
 * A leaf for a collected stamp — the brand's own mark rather than a generic
 * tick, so a full card reads as ten salads and not ten checkboxes.
 */
function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M20 3c0 9.4-4.6 14.2-11.4 14.2-1 0-2-.1-2.9-.4C7.4 11 12.3 7.4 18 6.2c-5.9.4-10.6 3.6-12.6 9.1C3.6 12.6 3.4 8.5 5.6 6 8.4 2.8 14.6 4.4 20 3Z" />
      <path d="M6 20.5c.6-2 1.4-3.8 2.4-5.3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** The reward slot's mark. */
function Gift({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 7c-1.3 0-2.4-.4-3-1.1-.7-.8-.6-1.9.1-2.6.8-.7 2-.6 2.7.2.5.6.8 1.5 1 2.4.2-.9.5-1.8 1-2.4.7-.8 1.9-.9 2.7-.2.7.7.8 1.8.1 2.6-.6.7-1.7 1.1-3 1.1h-1.6ZM3 8.5h18v3H3v-3ZM4.5 13h15v6.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V13Z" />
    </svg>
  );
}

/**
 * The punch card itself. Two rows of five echo a physical card, with the tenth
 * slot styled as the prize rather than just another circle — the old version
 * rendered ten identical numbered rings and hardcoded the last one as filled,
 * which told every customer they had already earned the free salad.
 */
export function StampCard({ stamps, goal }: { stamps: number; goal: number }) {
  const t = useTranslations("loyalty");
  const earnedReward = stamps >= goal;

  return (
    <ul
      role="list"
      aria-label={t("cardLabel")}
      className="mt-8 grid grid-cols-5 gap-3 sm:gap-4"
    >
      {Array.from({ length: goal }, (_, index) => {
        const position = index + 1;
        const isReward = position === goal;
        const filled = position <= stamps;

        if (isReward) {
          return (
            <li
              key={position}
              aria-label={t("rewardSlot", { n: position })}
              className={`flex aspect-square items-center justify-center rounded-full transition-colors ${
                earnedReward
                  ? "bg-lime text-forest ring-4 ring-lime/40"
                  : "border-2 border-forest/35 text-forest/35"
              }`}
            >
              <Gift className="size-1/2" />
            </li>
          );
        }

        return (
          <li
            key={position}
            aria-label={filled ? t("stampEarned", { n: position }) : t("stampPending", { n: position })}
            className={`flex aspect-square items-center justify-center rounded-full transition-colors ${
              filled
                ? "bg-forest text-lime"
                : "border-2 border-dashed border-border-subtle text-transparent"
            }`}
          >
            {filled ? (
              <Leaf className="size-1/2" />
            ) : (
              <span className="font-display text-sm text-on-surface-dim/50" aria-hidden="true">
                {position}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
