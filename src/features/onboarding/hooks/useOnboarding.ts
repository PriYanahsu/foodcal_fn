'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getFitness, queryKeys } from '@/app/service';
import { getLocal, setLocal, useLocalValue } from '@/lib/local-store';

/** UI-only memory (this device). Whether a user *needs* onboarding comes from the server. */
interface OnboardingFlags {
  welcomeSeen?: boolean;
  checklistDismissed?: boolean;
}

const onboardingKey = (userId: string) => `onboarding_${userId}`;
const NO_FLAGS: OnboardingFlags = {};

/**
 * First-run state. `hasPlan` is read straight from the fitness query (not the
 * profile hook's local copy, which lags a render behind), and `planKnown` stays
 * false until that query succeeds — a sleeping backend must never be mistaken
 * for "no plan" and bounce an existing user into the welcome flow.
 */
export function useOnboarding() {
  const { user } = useAuth();
  const userId = user?.id;
  const key = userId ? onboardingKey(userId) : null;
  const flags = useLocalValue<OnboardingFlags>(key, NO_FLAGS);

  const fitnessQuery = useQuery({
    queryKey: queryKeys.fitness(userId ?? ''),
    queryFn: getFitness,
    enabled: !!userId,
  });

  const planKnown = fitnessQuery.isSuccess;
  const hasPlan = !!fitnessQuery.data?.objective;

  const update = (patch: OnboardingFlags) => {
    if (!key) return;
    setLocal(key, { ...(getLocal<OnboardingFlags>(key) ?? {}), ...patch });
  };

  return {
    userId,
    planKnown,
    hasPlan,
    fitness: fitnessQuery.data ?? null,
    /** Signed-in user with no plan who hasn't finished or skipped the welcome flow. */
    needsWelcome: planKnown && !hasPlan && !flags.welcomeSeen,
    checklistDismissed: !!flags.checklistDismissed,
    /**
     * Meals, water and weigh-ins can't be logged until there's a plan to log them against.
     * Only locks once the server has said "no plan", never while it's still loading.
     */
    loggingLocked: planKnown && !hasPlan,
    markWelcomeSeen: () => update({ welcomeSeen: true }),
    dismissChecklist: () => update({ checklistDismissed: true }),
  };
}
