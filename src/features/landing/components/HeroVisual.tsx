import { CheckIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CalorieRing, MacroBar, MACRO_STYLES, type MacroKey } from '@/components/nutrition/macros';
import { MEAL_PHOTO_STYLE, SAMPLE_DAY, SAMPLE_SCAN } from '../landingData';

const MACROS: MacroKey[] = ['protein', 'carbs', 'fat'];

/** Decorative product shot: the scan result on a phone, with today's ring card and a toast. */
export function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-[440px] w-full max-w-[460px] select-none sm:h-[460px]"
    >
      {/* Phone */}
      <div className="absolute right-0 top-0 w-[236px] rounded-[34px] border border-line-strong bg-canvas-2 p-2 shadow-[0_24px_64px_rgba(0,0,0,0.45)] sm:right-2 sm:w-[260px]">
        <div className="overflow-hidden rounded-[26px] bg-surface-1">
          <div className="relative h-[124px]" style={MEAL_PHOTO_STYLE}>
            <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white">
              <XMarkIcon className="h-4 w-4" />
            </span>
            <div className="absolute bottom-2.5 left-3 flex gap-1.5">
              {SAMPLE_SCAN.detected.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-black/55 px-2 py-0.5 text-xs font-semibold text-white"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 p-3.5">
            <div>
              <p className="text-sm font-bold leading-snug text-fg">{SAMPLE_SCAN.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs text-muted">{SAMPLE_SCAN.serving}</span>
                <span className="whitespace-nowrap rounded-full bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand-ink">
                  {SAMPLE_SCAN.confidence}% confidence
                </span>
              </div>
            </div>

            <p className="font-display text-[34px] font-bold leading-none tracking-[-0.02em] text-fg">
              {SAMPLE_SCAN.kcal}
              <span className="ml-1 font-ui text-sm font-semibold text-muted">kcal</span>
            </p>

            <div className="grid grid-cols-3 gap-1.5">
              {MACROS.map((key) => (
                <div key={key} className="rounded-xl border border-line bg-surface-2 px-2 py-1.5">
                  <p className="text-xs text-muted">{MACRO_STYLES[key].label}</p>
                  <p className={`font-display text-base font-bold ${MACRO_STYLES[key].text}`}>
                    {SAMPLE_SCAN[key]}g
                  </p>
                </div>
              ))}
            </div>

            <p className="flex gap-1.5 rounded-xl bg-surface-2 p-2 text-xs leading-snug text-fg-2">
              <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-brand-ink" />
              {SAMPLE_SCAN.note}
            </p>

            <span className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand text-sm font-bold text-on-brand">
              <CheckIcon className="h-4 w-4" />
              Log meal
            </span>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className="absolute left-0 top-6 hidden items-center sm:flex gap-2.5 rounded-2xl border border-line-strong bg-surface-2 py-2.5 pl-2.5 pr-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] sm:left-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-on-brand">
          <CheckIcon className="h-4 w-4" />
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-bold text-fg">Meal logged</span>
          <span className="text-xs text-muted">Dinner · {SAMPLE_SCAN.kcal} kcal</span>
        </span>
      </div>

      {/* Today card */}
      <div className="absolute bottom-6 left-0 w-[200px] rounded-2xl sm:bottom-0 sm:w-[280px] border border-line-strong bg-surface-1 p-3.5 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-[0.06em] text-muted">Today</span>
          <span className="text-muted">{SAMPLE_DAY.label}</span>
        </div>
        <div className="flex items-center gap-3.5">
          <CalorieRing value={SAMPLE_DAY.kcalEaten} max={SAMPLE_DAY.kcalGoal} size={84} stroke={9}>
            <span className="font-display text-lg font-bold leading-none text-fg">
              {SAMPLE_DAY.kcalLeft.toLocaleString('en-US')}
            </span>
            <span className="mt-0.5 text-xs text-muted">kcal left</span>
          </CalorieRing>
          <div className="hidden min-w-0 flex-1 flex-col gap-2 sm:flex">
            {MACROS.map((key) => (
              <MacroBar
                key={key}
                macro={key}
                value={SAMPLE_DAY[key].value}
                max={SAMPLE_DAY[key].max}
              />
            ))}
          </div>
          {/* Phones: too narrow for bars, so show the two totals instead. */}
          <dl className="flex flex-col gap-2 sm:hidden">
            <div>
              <dt className="text-xs text-muted">Eaten</dt>
              <dd className="font-display text-base font-bold text-fg">{SAMPLE_DAY.kcalEaten}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Goal</dt>
              <dd className="font-display text-base font-bold text-fg">
                {SAMPLE_DAY.kcalGoal.toLocaleString('en-US')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
