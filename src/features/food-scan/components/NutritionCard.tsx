'use client';

import React from 'react';
import { NutritionData } from '../services/scan.api';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface NutritionCardProps {
  data: NutritionData;
  compact?: boolean;
}

const MACROS = [
  { key: 'proteinG' as const, label: 'Protein', unit: 'g', color: 'var(--primary)' },
  { key: 'carbohydrateG' as const, label: 'Carbs', unit: 'g', color: '#f5c542' },
  { key: 'fatG' as const, label: 'Fats', unit: 'g', color: '#ff6b8a' },
];

export const NutritionCard: React.FC<NutritionCardProps> = ({ data, compact = false }) => {
  const confidencePct = Math.round((data.aiConfidence ?? 0) * 100);

  if (compact) {
    const insight = data.analysisNotes;

    return (
      <div className="h-full min-h-0 flex flex-col gap-2 animate-fade-in">
        {/* Identity */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 shrink-0">
          <div className="absolute -top-10 -right-8 w-28 h-28 rounded-full bg-[var(--primary)]/10 blur-2xl pointer-events-none" />

          <div className="relative flex items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-1">
                <SparklesIcon className="w-3 h-3" />
                AI Prediction
              </div>
              <h3 className="text-[15px] font-black tracking-tight text-[var(--foreground)] leading-snug line-clamp-2">
                {data.foodName || 'Detected Meal'}
              </h3>
              {data.quantity && (
                <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5 truncate">
                  Serving · {data.quantity}
                </p>
              )}
            </div>

            <div className="shrink-0 relative w-11 h-11">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="var(--surface-strong)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${confidencePct} ${100 - confidencePct}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-[var(--foreground)] leading-none">
                  {confidencePct}%
                </span>
                <span className="text-[6px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                  conf
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-2.5 pt-2.5 border-t border-[var(--card-border)] flex items-baseline justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">
              Energy
            </span>
            <p className="text-[22px] font-black tracking-tighter text-[var(--foreground)] leading-none">
              {Math.round(data.calories)}
              <span className="text-[11px] font-bold text-[var(--text-muted)] ml-1">kcal</span>
            </p>
          </div>
        </div>

        {/* Macros — fixed height, not stretched */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          {MACROS.map((macro) => (
            <div
              key={macro.key}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-2 py-2.5 text-center"
            >
              <div
                className="mx-auto mb-1.5 h-1 w-7 rounded-full"
                style={{ background: macro.color, boxShadow: `0 0 10px ${macro.color}55` }}
              />
              <p className="text-base font-black text-[var(--foreground)] tracking-tight leading-none">
                {Math.round(data[macro.key])}
                <span className="text-[10px] text-[var(--text-muted)] ml-0.5">{macro.unit}</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">
                {macro.label}
              </p>
            </div>
          ))}
        </div>

        {/* Insight fills leftover space cleanly */}
        {insight ? (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-3 py-2 flex-1 min-h-0 overflow-hidden">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--primary)] mb-1">
              AI Insight
            </p>
            <p className="text-[11px] leading-snug text-[var(--foreground)]/70 line-clamp-3">
              {insight}
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5 md:space-y-4 animate-fade-in">
      {/* Identity + confidence */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-3 md:p-5">
        <div className="absolute -top-16 -right-10 w-40 h-40 rounded-full bg-[var(--primary)]/10 blur-3xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1 md:space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[var(--primary)]">
              <SparklesIcon className="w-3 h-3" />
              AI Prediction
            </div>
            <h3 className="text-base md:text-2xl font-black tracking-tight text-[var(--foreground)] leading-snug line-clamp-2">
              {data.foodName || 'Detected Meal'}
            </h3>
            {data.quantity && (
              <p className="text-[11px] md:text-xs font-semibold text-[var(--text-muted)]">
                Estimated serving · {data.quantity}
              </p>
            )}
          </div>

          <div className="shrink-0 relative w-12 h-12 md:w-16 md:h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="var(--surface-strong)"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${confidencePct} ${100 - confidencePct}`}
                className="drop-shadow-[0_0_8px_var(--primary)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] md:text-sm font-black text-[var(--foreground)] leading-none">
                {confidencePct}%
              </span>
              <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                conf
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop calorie hero */}
      <div className="rounded-3xl border border-[var(--primary)]/25 bg-[var(--primary)]/[0.06] px-5 py-6 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/60 to-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--primary)] mb-2">
          Estimated Energy
        </p>
        <p className="text-5xl font-black tracking-tighter text-[var(--foreground)]">
          {Math.round(data.calories)}
          <span className="text-lg font-bold text-[var(--text-muted)] ml-1">kcal</span>
        </p>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {MACROS.map((macro) => (
          <div
            key={macro.key}
            className="rounded-xl md:rounded-2xl border border-[var(--card-border)] bg-[var(--surface)] px-2 py-2.5 md:px-3 md:py-4 text-center"
          >
            <div
              className="mx-auto mb-1.5 md:mb-2 h-1 w-6 md:w-8 rounded-full"
              style={{ background: macro.color, boxShadow: `0 0 12px ${macro.color}66` }}
            />
            <p className="text-base md:text-xl font-black text-[var(--foreground)] tracking-tight">
              {Math.round(data[macro.key])}
              <span className="text-[10px] md:text-xs text-[var(--text-muted)] ml-0.5">{macro.unit}</span>
            </p>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5 md:mt-1">
              {macro.label}
            </p>
          </div>
        ))}
      </div>

      {(data.analysisNotes) && (
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--surface)] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-2">
            AI Insight
          </p>
          <p className="text-sm leading-relaxed text-[var(--foreground)]/75">
            {data.analysisNotes}
          </p>
        </div>
      )}
    </div>
  );
};
