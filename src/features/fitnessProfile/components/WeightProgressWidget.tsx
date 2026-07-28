'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ScaleIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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
  const supabase = createClient();
  const [currentWeight, setCurrentWeight] = useState<number | null>(initialWeight);
  const [loading, setLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    async function fetchLatestWeight() {
      setLoading(true);
      const { data } = await supabase
        .from('weight_logs')
        .select('weight')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setCurrentWeight(data[0].weight);
      } else if (initialWeight != null) {
        setCurrentWeight(initialWeight);
      } else {
        setCurrentWeight(null);
      }
      setLoading(false);
    }

    if (userId) fetchLatestWeight();
  }, [userId, initialWeight]);

  const handleLogWeight = async () => {
    const weightValue = parseFloat(newWeight);
    if (!newWeight || isNaN(weightValue)) return;

    setLoading(true);

    // 1. Log to weight_logs history
    const { error: logError } = await supabase
      .from('weight_logs')
      .insert({ user_id: userId, weight: weightValue });

    if (!logError) {
      // 2. Update profiles table for sync across app
      await supabase.from('profiles').update({ weight: weightValue }).eq('id', userId);

      setCurrentWeight(weightValue);
      setIsLogging(false);
      setNewWeight('');
      if (onLogSuccess) onLogSuccess();
    } else {
      alert('Failed to log weight');
    }
    setLoading(false);
  };

  if (!targetWeight && !currentWeight) return null;

  const progress =
    currentWeight && targetWeight
      ? Math.abs(currentWeight - targetWeight) // This is just a placeholder logic, simpler than real progress %
      : 0;

  return (
    <div
      className={`bg-gradient-to-br from-[var(--card-bg)]/40 to-black/10 backdrop-blur-md border border-white/5 rounded-2xl transition-all ${compact ? 'p-4 mt-0' : 'p-6 mt-4'}`}
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
        <div className="flex gap-3 animate-slide-up">
          <input
            type="number"
            step="0.1"
            autoFocus
            placeholder="Weight in kg"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--primary)]/50 transition-colors text-white placeholder:text-white/20 font-medium"
          />
          <button
            onClick={handleLogWeight}
            disabled={loading}
            className="bg-[var(--primary)] text-black px-6 py-2 rounded-xl font-black text-sm hover:scale-105 transition-transform disabled:opacity-50"
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
                className={`${compact ? 'text-3xl' : 'text-4xl'} font-black tabular-nums tracking-tighter text-white`}
              >
                {loading ? (
                  <div className="h-10 w-24 bg-white/5 animate-pulse rounded-lg" />
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
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full w-1/2 shadow-[0_0_10px_rgba(0,255,136,0.3)] anim-progress" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
