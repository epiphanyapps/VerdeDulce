import Image from "next/image";
import type { MenuItem } from "@/content/menu";
import type { Locale } from "@/i18n/routing";

/**
 * Menu photography, or a branded stand-in when we have no photo for a dish.
 *
 * The original library lived in an S3 bucket that has since been deleted, so
 * most items currently have `image: null`. Dropping a file into
 * `public/menu/` and setting the item's `image` field is all it takes to
 * replace a placeholder — no component change.
 */
export function MenuImage({
  item,
  locale,
  sizes,
  priority = false,
  className = "",
}: {
  item: MenuItem;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const name = item.name[locale];

  if (item.image) {
    return (
      <Image
        src={item.image}
        alt={name}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  // Deterministic tint per dish so the grid reads as varied rather than as a
  // wall of identical grey boxes.
  const hue = [...item.slug].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 40;

  return (
    <div
      role="img"
      aria-label={name}
      className="flex size-full items-center justify-center p-6"
      // Lightness stays high enough that forest/85 text clears 4.5:1 on every
      // hue in the range; axe checks this in e2e/a11y.spec.ts.
      style={{ backgroundColor: `hsl(${70 + hue} 24% 90%)` }}
    >
      <span
        aria-hidden="true"
        className="text-center font-display text-lg font-light leading-snug text-forest/85"
      >
        {name}
      </span>
    </div>
  );
}
