import type { ComponentType, SVGProps } from 'react';
import { CakeIcon, FireIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import type { FoodLog } from '@/features/Nutrition/type';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Tile colour + icon per meal type, used when a meal has no photo. */
const MEAL_STYLES: Record<string, { tile: string; icon: Icon }> = {
  breakfast: { tile: 'bg-carbs/15 text-carbs', icon: SunIcon },
  lunch: { tile: 'bg-protein/15 text-protein', icon: FireIcon },
  dinner: { tile: 'bg-fat/15 text-fat', icon: MoonIcon },
  snack: { tile: 'bg-brand/15 text-brand-ink', icon: CakeIcon },
};

/** The meal's photo, or a tinted meal-type icon when there isn't one. */
export function MealThumb({ log, className = 'h-12 w-12' }: { log: FoodLog; className?: string }) {
  if (log.imagePath) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- user photos come from storage URLs */
      <img
        src={log.imagePath}
        alt=""
        loading="lazy"
        className={`shrink-0 rounded-xl object-cover ${className}`}
      />
    );
  }
  const style = MEAL_STYLES[log.mealType?.toLowerCase()] ?? MEAL_STYLES.snack;
  const Icon = style.icon;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl ${style.tile} ${className}`}
    >
      <Icon className="h-1/2 w-1/2" />
    </span>
  );
}
