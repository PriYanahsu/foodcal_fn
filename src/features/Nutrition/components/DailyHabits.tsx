'use client';

import { DAILY_HABITS } from '../utils/Constants';

export default function DailyHabits() {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6">
      <h3 className="font-bold text-base sm:text-lg text-[var(--foreground)]">Daily Habits</h3>

      <div className="space-y-4 sm:space-y-5">
        {DAILY_HABITS.map((habit) => (
          <div key={habit.key} className="flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-sm sm:text-base shrink-0">
              {habit.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="font-bold text-xs sm:text-sm text-[var(--foreground)]">
                  {habit.label}
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-[var(--primary)]">
                  {habit.value}
                </span>
              </div>
              <div className="w-full bg-[var(--surface-strong)] h-2.5 rounded-full overflow-hidden border border-[var(--card-border)]">
                <div className={`h-full bg-[var(--primary)] rounded-full ${habit.barClass}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
