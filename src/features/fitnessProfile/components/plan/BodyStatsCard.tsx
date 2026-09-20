'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { FitnessDetails } from '@/features/userProfile';

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Read-only body metrics; editing lives on the profile screen. */
export default function BodyStatsCard({
  fitness,
  bmi,
}: {
  fitness: FitnessDetails | null;
  bmi: string;
}) {
  const rows: [string, string][] = [
    ['Height', fitness?.height ? `${fitness.height} cm` : '—'],
    ['Age', fitness?.age ? `${fitness.age} yrs` : '—'],
    ['BMI', bmi],
    ['Activity', fitness?.activityLevel || '—'],
    ['Target weight', fitness?.targetWeightKg ? `${fitness.targetWeightKg} kg` : '—'],
    ['Target date', fitness?.targetDate ? shortDate(fitness.targetDate) : '—'],
  ];

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-fg">Your body</h2>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm font-bold text-brand-ink hover:underline"
        >
          Edit
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-x-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-2 border-b border-line py-2.5 [&:nth-last-child(-n+2)]:border-0"
          >
            <dt className="truncate text-caption text-muted">{label}</dt>
            <dd className="truncate text-sm font-bold text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
