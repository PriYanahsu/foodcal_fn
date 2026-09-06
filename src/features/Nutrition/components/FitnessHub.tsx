'use client';

import Link from 'next/link';
import { ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { FitnessHubProps } from '../type';

export default function FitnessHub({ hasPlan, aiCoachAdvice, targetWeightKg }: FitnessHubProps) {
  return (
    <Link href="/fitness" className="block group">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden transition-all hover:scale-[1.02] hover:border-[var(--primary)]/40 isolate">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-black flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-[var(--foreground)]">
                Fitness Hub
              </h3>
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${hasPlan ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
              >
                {hasPlan ? 'AI Coach Active' : 'No plan yet'}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center group-hover:bg-[var(--surface-strong)] transition-colors">
            <ChevronRightIcon className="w-4 h-4 text-[var(--foreground)]" />
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[var(--card-border)] mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-[var(--text-muted)] italic leading-relaxed">
            &quot;{aiCoachAdvice || 'Log more meals to unlock personalized insights.'}&quot;
          </p>
        </div>

        {!!targetWeightKg && (
          <div className="flex justify-between items-center text-xs font-medium text-[var(--text-muted)]">
            <span>Target: {targetWeightKg}kg</span>
            <span className="text-[var(--foreground)] group-hover:underline group-hover:text-[var(--primary)]">
              View Progress
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
