'use client';

import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useMealDetail } from '../hooks/useMealDetail';
import { mealMacros } from '../utils/helper';
import type { MealDetailViewProps } from '../type';

export default function MealDetailView({ date, mealId }: MealDetailViewProps) {
  const router = useRouter();
  const { meal, loading } = useMealDetail(date, mealId);

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl border-2 border-[var(--primary)]/30 border-t-[var(--primary)] animate-spin" />
        <p className="text-sm font-medium text-[var(--text-muted)]">Loading meal…</p>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="max-w-md mx-auto min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-[var(--foreground)] font-bold">Meal not found</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--btn-primary)] text-black text-sm font-bold hover:bg-[var(--btn-primary-hover)] transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Go back
        </button>
      </div>
    );
  }

  const macros = mealMacros({
    proteins: meal.proteinG ?? 0,
    carbohydrates: meal.carbohydrateG ?? 0,
    fats: meal.fatG ?? 0,
  });

  return (
    <div className="max-w-md mx-auto space-y-5 pb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm font-semibold text-[var(--foreground)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)] transition-colors shadow-sm"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <div className="w-full aspect-[4/3] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden flex items-center justify-center shadow-sm">
        {meal.imagePath ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={meal.imagePath} alt={meal.foodName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[var(--text-muted)] text-sm">No image available</span>
        )}
      </div>

      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)] leading-tight">
            {meal.foodName}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mt-2.5 bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/25">
            <SparklesIcon className="w-3 h-3" />
            {meal.isManual ? 'Manual' : 'AI Analysis'}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="block text-3xl sm:text-4xl font-black text-[var(--primary)] tabular-nums leading-none">
            {meal.calories}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            kcal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {macros.map((m) => (
          <div
            key={m.label}
            className="bg-[var(--card-bg)] p-4 rounded-2xl text-center border border-[var(--card-border)] shadow-sm"
          >
            <div
              className="mx-auto mb-2 h-1 w-8 rounded-full"
              style={{ background: m.color }}
            />
            <span className="block text-xl font-black tabular-nums" style={{ color: m.color }}>
              {m.value}g
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--card-border)] text-sm space-y-3 shadow-sm">
        <div className="flex justify-between gap-3">
          <span className="text-[var(--text-muted)]">Time</span>
          <span className="font-semibold text-[var(--foreground)] text-right">
            {new Date(meal.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="h-px bg-[var(--card-border)]" />
        <div className="flex justify-between gap-3">
          <span className="text-[var(--text-muted)]">Meal Type</span>
          <span className="font-semibold text-[var(--foreground)] capitalize">{meal.mealType}</span>
        </div>
        {!meal.isManual && (
          <>
            <div className="h-px bg-[var(--card-border)]" />
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-muted)]">AI Confidence</span>
              <span className="font-bold text-[var(--primary)]">
                {Math.round((meal.confidenceLevel || 0) * 100)}%
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
