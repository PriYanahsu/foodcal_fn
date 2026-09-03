'use client';

import React, { useEffect, useState } from 'react';
import { ScaleIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { getLocal, setLocal } from '@/lib/local-store';

interface WeightLog {
  weight: number;
  created_at: string;
}

export default function WeightProgressWidget({
  userId,
  targetWeight,
  initialWeight = null,
  onLogSuccess,
  compact = false,
}: {
  userId: string;
  targetWeight: number | null;
  /** Profile weight fallback when no weight_logs yet */
  initialWeight?: number | null;
  onLogSuccess?: () => void;
  compact?: boolean;
}) {
  const [currentWeight, setCurrentWeight] = useState<number | null>(initialWeight);
  const [loading, setLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    const logs = getLocal<{ weight: number }[]>(`weight_logs_${userId}`) || [];
    if (logs.length) setCurrentWeight(logs[0].weight);
    else if (initialWeight != null) setCurrentWeight(initialWeight);
    else setCurrentWeight(null);
    setLoading(false);
  }, [userId, initialWeight]);

  const handleLogWeight = async () => {
    const weightValue = parseFloat(newWeight);
    if (!newWeight || isNaN(weightValue)) return;
    setLoading(true);
    const logs = getLocal<{ weight: number; created_at: string }[]>(`weight_logs_${userId}`) || [];
    logs.unshift({ weight: weightValue, created_at: new Date().toISOString() });
    setLocal(`weight_logs_${userId}`, logs);
    const profile = getLocal<Record<string, unknown>>(`profile_${userId}`) || {};
    setLocal(`profile_${userId}`, { ...profile, weight: weightValue });
    setCurrentWeight(weightValue);
    setIsLogging(false);
    setNewWeight('');
    onLogSuccess?.();
    setLoading(false);
  };

  if (!targetWeight && !currentWeight) return null;

  const progress =
    currentWeight && targetWeight
      ? Math.abs(currentWeight - targetWeight) // This is just a placeholder logic, simpler than real progress %
      : 0;

  return (
    <div
      className={`bg-gradient-to-br from-[var(--card-bg)]/40 to-black/10 backdrop-blur-md border border-[var(--card-border)] rounded-2xl transition-all min-w-0 overflow-hidden ${compact ? 'p-3 sm:p-4 mt-0' : 'p-4 sm:p-6 mt-4'}`}
    >
      <div className={`flex justify-between items-center ${compact ? 'mb-4' : 'mb-6'}`}>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]/70 flex items-center gap-2">
          <ScaleIcon className="w-4 h-4" /> Progression Metric
        </h3>
        <button
          onClick={() => {
            setIsLogging(!isLogging);
            if (!isLogging) {
              setNewWeight(currentWeight != null ? String(currentWeight) : '');
            } else {
              setNewWeight('');
            }
          }}
          className="group/add p-1.5 hover:bg-[var(--primary)]/10 rounded-lg transition-all text-[var(--text-muted)] hover:text-[var(--primary)]"
        >
          <PlusIcon className="w-5 h-5 group-hover/add:rotate-90 transition-transform" />
        </button>
      </div>

      {isLogging ? (
        <div className="flex items-stretch gap-2 sm:gap-3 animate-slide-up min-w-0 w-full max-w-full">
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            autoFocus
            placeholder="Weight in kg"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="min-w-0 w-0 flex-1 bg-black/40 border border-[var(--card-border)] rounded-xl px-3 sm:px-4 py-2 outline-none focus:border-[var(--primary)]/50 transition-colors text-[var(--foreground)] placeholder:text-[var(--text-muted)] font-medium text-sm"
          />
          <button
            onClick={handleLogWeight}
            disabled={loading}
            className="shrink-0 bg-[var(--btn-primary)] text-black px-4 sm:px-6 py-2 rounded-xl font-black text-sm hover:scale-105 transition-transform disabled:opacity-50"
          >
            Save
          </button>
        </div>
      ) : (
        <div className={compact ? 'space-y-4' : 'space-y-6'}>
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest opacity-60">
                Live Status
              </span>
              <div
                className={`${compact ? 'text-3xl' : 'text-4xl'} font-black tabular-nums tracking-tighter text-[var(--foreground)]`}
              >
                {loading ? (
                  <div className="h-10 w-24 bg-[var(--surface)] animate-pulse rounded-lg" />
                ) : currentWeight ? (
                  <span className="flex items-baseline gap-1">
                    {currentWeight}
                    <span className="text-sm font-bold opacity-40">KG</span>
                  </span>
                ) : (
                  '--'
                )}
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest opacity-60">
                Objective
              </span>
              <div
                className={`${compact ? 'text-xl' : 'text-2xl'} font-black text-[var(--primary)] tabular-nums tracking-tighter`}
              >
                {targetWeight ? (
                  <span className="flex items-baseline gap-1 justify-end">
                    {targetWeight}
                    <span className="text-xs font-bold opacity-40">KG</span>
                  </span>
                ) : (
                  'Not Set'
                )}
              </div>
            </div>
          </div>

          {currentWeight && targetWeight && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-[var(--text-muted)]">Remaining distance</span>
                <span className="text-[var(--primary)]">
                  {Math.abs(currentWeight - targetWeight).toFixed(1)} kg
                </span>
              </div>
              <div className="h-2.5 w-full bg-[var(--surface-strong)] rounded-full overflow-hidden border border-[var(--card-border)]">
                <div className="h-full bg-[var(--primary)] rounded-full w-1/2 shadow-[0_0_10px_rgba(118,185,0,0.3)] anim-progress" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
