'use client';

import React from 'react';
import { NutritionData } from '../services/scan.api';
import { formatCalories } from '@/utils/formatCalories';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface NutritionCardProps {
  data: NutritionData;
}

const MACROS = [
  { key: 'protein' as const, label: 'Protein', unit: 'g', color: 'var(--primary)' },
  { key: 'carbs' as const, label: 'Carbs', unit: 'g', color: '#f5c542' },
  { key: 'fats' as const, label: 'Fats', unit: 'g', color: '#ff6b8a' },
];

export const NutritionCard: React.FC<NutritionCardProps> = ({ data }) => {
  const confidencePct = Math.round((data.confidence ?? 0) * 100);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Identity + confidence */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
        <div className="absolute -top-16 -right-10 w-40 h-40 rounded-full bg-[var(--primary)]/10 blur-3xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[var(--primary)]">
              <SparklesIcon className="w-3 h-3" />
              AI Prediction
            </div>
            <h3 className="text-2xl font-black tracking-tight text-[var(--foreground)] leading-tight">
              {data.food_name || 'Detected Meal'}
            </h3>
            {data.quantity && (
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Estimated serving · {data.quantity}
              </p>
            )}
          </div>

          <div className="shrink-0 relative w-16 h-16">
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
              <span className="text-sm font-black text-[var(--foreground)] leading-none">{confidencePct}%</span>
              <span className="text-[7px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                conf
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calorie hero */}
      <div className="rounded-3xl border border-[var(--primary)]/25 bg-[var(--primary)]/[0.06] px-5 py-6 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/60 to-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--primary)] mb-2">
          Estimated Energy
        </p>
        <p className="text-5xl font-black tracking-tighter text-[var(--foreground)]">
          {formatCalories(data.calories)}
          <span className="text-lg font-bold text-[var(--text-muted)] ml-1">kcal</span>
        </p>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-3">
        {MACROS.map((macro) => (
          <div
            key={macro.key}
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--surface)] px-3 py-4 text-center"
          >
            <div
              className="mx-auto mb-2 h-1 w-8 rounded-full"
              style={{ background: macro.color, boxShadow: `0 0 12px ${macro.color}66` }}
            />
            <p className="text-xl font-black text-[var(--foreground)] tracking-tight">
              {Math.round(data[macro.key])}
              <span className="text-xs text-[var(--text-muted)] ml-0.5">{macro.unit}</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">
              {macro.label}
            </p>
          </div>
        ))}
      </div>

      {/* Insight */}
      {(data.health_info || data.analysis_notes) && (
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--surface)] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-2">
            AI Insight
          </p>
          <p className="text-sm leading-relaxed text-[var(--foreground)]/75">
            {data.health_info || data.analysis_notes}
          </p>
        </div>
      )}
    </div>
  );
};
