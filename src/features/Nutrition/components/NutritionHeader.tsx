'use client';

import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { buttonClass } from '@/components/ui/fc';
import { ROUTES } from '@/constants/routes';
import { usePlanGate } from '@/features/onboarding';
import { formatLongDate, greetingFor } from '../utils/toLocalDate';

interface NutritionHeaderProps {
  userName: string;
  selectedDate: string;
}

export default function NutritionHeader({ userName, selectedDate }: NutritionHeaderProps) {
  const firstName = userName.split(' ')[0];
  const { canLog, showPlanWarning } = usePlanGate();

  return (
    <header className="flex items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm text-muted">{formatLongDate(selectedDate)}</p>
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-fg md:text-[34px]">
          {greetingFor()}, {firstName}
        </h1>
      </div>

      {/* Phones get the bell in the app's top bar and "Log a meal" in the bottom tab bar. */}
      <div className="hidden items-center gap-3 md:flex">
        <NotificationBell />
        <Link
          href={ROUTES.SCAN}
          onClick={(e) => {
            if (canLog) return;
            e.preventDefault();
            showPlanWarning();
          }}
          className={buttonClass('primary', 'md')}
        >
          <PlusIcon className="h-5 w-5" strokeWidth={2} />
          Log a meal
        </Link>
      </div>
    </header>
  );
}
