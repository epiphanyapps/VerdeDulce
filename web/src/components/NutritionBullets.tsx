import { useTranslations } from "next-intl";
import type { MenuItem } from "@/content/menu";

/**
 * The four macro figures under a menu card. Ported from the RN `Bullets`
 * component, but as a description list so the number/label pairing is carried
 * by the markup rather than by visual proximity alone.
 */
export function NutritionBullets({
  nutrition,
  className = "",
}: {
  nutrition: MenuItem["nutrition"];
  className?: string;
}) {
  const t = useTranslations("nutrition");

  const stats = [
    { label: t("calories"), value: String(nutrition.calories) },
    { label: t("carbs"), value: t("grams", { value: nutrition.carbs }) },
    { label: t("protein"), value: t("grams", { value: nutrition.protein }) },
    { label: t("fat"), value: t("grams", { value: nutrition.fat }) },
  ];

  return (
    <dl className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}>
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-14">
          <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-on-surface-dim">
            {stat.label}
          </dt>
          <dd className="font-display text-lg leading-tight">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
