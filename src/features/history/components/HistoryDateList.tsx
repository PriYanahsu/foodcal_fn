'use client';

import Link from 'next/link';
import {
  CalendarIcon,
  ChevronRightIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { StatCard } from '@/components/dashboard/StatCard';
import { useHistory } from '../hooks/useHistory';
import { calorieProgress, formatDayLabel, isHistoryToday } from '../utils/helper';

export default function HistoryDateList() {
  const { history, loading, stats, target } = useHistory();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="space-y-4 lg:space-y-5">
        <header className="relative py-6 px-5 rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent border border-[var(--card-border)] shadow-xl">
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            Meal{' '}
            <span className="text-[var(--primary)]">
              History
            </span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Track your nutrition journey over time.</p>
        </header>
        <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg)]/50">
          <CalendarIcon className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <p className="text-[var(--text-muted)] font-medium">No meal history yet.</p>
          <Link
            href="/scan"
            className="inline-flex mt-4 btn-primary px-5 py-2 text-sm shadow-[0_0_15px_#76b90022]"
          >
            Scan your first meal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-4 lg:h-[calc(100dvh-5rem)] lg:flex lg:flex-col">
      <header className="relative py-4 px-5 lg:py-5 lg:px-6 rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent border border-[var(--card-border)] shadow-xl shrink-0">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
          <ChartBarIcon className="w-28 h-28 text-[var(--primary)]" />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[9px] font-bold uppercase tracking-widest mb-1.5">
              <SparklesIcon className="w-3 h-3" />
              Nutrition Log
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Meal{' '}
              <span className="text-[var(--primary)]">
                History
              </span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {history.length} days tracked
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end shrink-0">
            <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
              All-time total
            </span>
            <span className="text-2xl font-black text-[var(--primary)] tabular-nums">
              {Math.round(stats.totalCalories).toLocaleString()}
              <span className="text-xs font-medium text-[var(--text-muted)] ml-1">kcal</span>
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 shrink-0">
        <StatCard
          label="Days Logged"
          value={history.length}
          unit="days"
          icon="📅"
          color="var(--primary)"
          delay={0}
        />
        <StatCard
          label="Total Calories"
          value={Math.round(stats.totalCalories)}
          unit="kcal"
          icon="🍽️"
          color="#2196f3"
          delay={0.05}
        />
        <StatCard
          label="Avg / Day"
          value={stats.avgCalories}
          unit="kcal"
          icon="📊"
          color="#ff9800"
          delay={0.1}
        />
        <StatCard
          label="This Week"
          value={Math.round(stats.weekCalories)}
          unit="kcal"
          icon="🔥"
          color="#e91e63"
          delay={0.15}
        />
      </div>

      <div className="lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="lg:h-full lg:overflow-y-auto lg:pr-1 space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3 lg:content-start lg:pb-2">
          {history.map((day) => {
            const progress = calorieProgress(day.stats.calories, target);
            const isToday = isHistoryToday(day.date);

            return (
              <Link
                href={`/history/${day.date}`}
                key={day.date}
                className="block bg-[var(--card-bg)]/80 backdrop-blur-xl p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-[var(--card-border)] hover:border-[var(--primary)]/50 transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${isToday ? 'bg-[var(--primary)]/15 border border-[var(--primary)]/30' : 'bg-blue-500/10 border border-blue-500/20'}`}
                    >
                      <CalendarIcon
                        className={`h-5 w-5 ${isToday ? 'text-[var(--primary)]' : 'text-blue-400'}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm lg:text-base text-[var(--foreground)] truncate">
                          {formatDayLabel(day.date)}
                        </h3>
                        {isToday && (
                          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--primary)]/20 text-[var(--primary)] shrink-0">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] lg:text-xs text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                        <span>P {Math.round(day.stats.proteins)}g</span>
                        <span>C {Math.round(day.stats.carbohydrates)}g</span>
                        <span>F {Math.round(day.stats.fats)}g</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="block font-black text-[var(--primary)] text-base lg:text-lg tabular-nums leading-none">
                        {Math.round(day.stats.calories)}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">
                        kcal
                      </span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
                    <span className="text-[var(--text-muted)]">Daily target</span>
                    <span className={progress > 100 ? 'text-orange-400' : 'text-[var(--primary)]'}>
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[var(--surface-strong)] rounded-full overflow-hidden border border-[var(--card-border)]">
                    <div
                      className={`h-full rounded-full transition-all ${progress > 100 ? 'bg-orange-400' : 'bg-[var(--primary)]'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
