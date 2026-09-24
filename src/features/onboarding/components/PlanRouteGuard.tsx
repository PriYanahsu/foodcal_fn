'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';
import { PageLoader } from '@/components/ui/PageLoader';
import { ROUTES } from '@/constants/routes';
import { useOnboarding } from '../hooks/useOnboarding';

/**
 * Strict gate for every signed-in page: nothing in the app (dashboard, camera, water,
 * weigh-ins, history, …) is reachable until the AI plan exists. Until the server has
 * confirmed a plan, only a loader shows (no nav, no content); with no plan, the person
 * is sent to the plan setup, which can't be skipped.
 */
export function PlanRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { userId, planKnown, hasPlan, planCheckFailed, retryPlanCheck } = useOnboarding();
  const noPlan = !!userId && planKnown && !hasPlan;

  useEffect(() => {
    if (noPlan) router.replace(ROUTES.WELCOME);
  }, [noPlan, router]);

  // Signed out: the middleware and auth pages handle it.
  if (!userId) return <>{children}</>;
  if (planKnown && hasPlan) return <>{children}</>;

  if (planCheckFailed) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center font-ui text-fg">
        <p className="text-lg font-bold">We couldn&apos;t check your plan</p>
        <p className="max-w-sm text-sm text-muted">
          Check your connection and try again. Everything opens once we know your plan is set.
        </p>
        <button
          type="button"
          onClick={() => void retryPlanCheck()}
          className={buttonClass('primary', 'md')}
        >
          <ArrowPathIcon className="h-5 w-5" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <PageLoader />
    </div>
  );
}
