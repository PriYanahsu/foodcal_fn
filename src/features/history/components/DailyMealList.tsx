'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MealLog } from '../types';
import Link from 'next/link';
import {
  ClockIcon,
  FireIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { StatCard } from '@/components/dashboard/StatCard';

interface DailyMealListProps {
  date: string;
}

export default function DailyMealList({ date }: DailyMealListProps) {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMeals([]);
    setLoading(false);
  }, [user, date]);

  const totals = useMemo(
    () =>
      meals.reduce(
        (acc, m) => ({
          calories: acc.calories + (m.calories || 0),
          protein: acc.protein + (m.protein || 0),
          carbs: acc.carbs + (m.carbs || 0),
          fats: acc.fats + (m.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      ),
    [meals]
  );

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="space-y-4">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to history
        </Link>
        <div className="text-center py-12 rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg)]/50">
          <p className="text-[var(--text-muted)]">No meals found for {formattedDate}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-4 lg:h-[calc(100dvh-5rem)] lg:flex lg:flex-col">
      <div className="flex items-center justify-between gap-3 shrink-0">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </Link>
        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider truncate">
          {meals.length} meal{meals.length !== 1 ? 's' : ''}
        </p>
      </div>

      <header className="relative py-4 px-5 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent border border-[var(--card-border)] shadow-xl shrink-0">
        <h1 className="text-xl lg:text-2xl font-black tracking-tight capitalize">{formattedDate}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          <span className="font-bold text-[var(--primary)]">{totals.calories}</span> kcal total
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 shrink-0">
        <StatCard label="Calories" value={totals.calories} unit="kcal" icon="🔥" color="var(--primary)" delay={0} />
        <StatCard label="Protein" value={Math.round(totals.protein)} unit="g" icon="🥩" color="#2196f3" delay={0.05} />
        <StatCard label="Carbs" value={Math.round(totals.carbs)} unit="g" icon="🍞" color="#ff9800" delay={0.1} />
        <StatCard label="Fats" value={Math.round(totals.fats)} unit="g" icon="🥑" color="#e91e63" delay={0.15} />
      </div>

      <div className="lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="lg:h-full lg:overflow-y-auto lg:pr-1 space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:content-start">
          {meals.map((meal) => (
            <Link
              href={`/history/${date}/${meal.id}`}
              key={meal.id}
              className="block bg-[var(--card-bg)]/80 backdrop-blur-xl p-3 lg:p-4 rounded-xl border border-[var(--card-border)] hover:border-[var(--primary)]/50 transition-all group"
            >
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 shrink-0">
                    <ClockIcon className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[var(--foreground)] truncate">{meal.food_name}</h3>
                    <p className="text-[10px] text-[var(--text-muted)] capitalize flex items-center gap-2">
                      {meal.meal_type}
                      <span className="opacity-40">·</span>
                      {new Date(meal.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center text-[var(--primary)] font-black text-sm tabular-nums">
                    <FireIcon className="h-3.5 w-3.5 mr-0.5" />
                    {meal.calories}
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                </div>
              </div>

              <div className="mt-2 flex gap-3 text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <span>P {Math.round(meal.protein || 0)}g</span>
                <span>C {Math.round(meal.carbs || 0)}g</span>
                <span>F {Math.round(meal.fats || 0)}g</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
