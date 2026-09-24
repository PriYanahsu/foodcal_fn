'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getFitness, queryKeys } from '@/app/service';
import { getLocal, setLocal, useLocalValue } from '@/lib/local-store';
import { toLocalDate } from '@/features/Nutrition/utils/toLocalDate';

/** UI-only memory (this device). Whether a user *needs* onboarding comes from the server. */
interface OnboardingFlags {
  welcomeSeen?: boolean;
  checklistDismissed?: boolean;
  /** Day (`YYYY-MM-DD`) the user last chose to scan without a plan — we ask at most once a day. */
  scanWithoutPlanOn?: string;
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
    /** No plan yet, and they haven't already said "scan anyway" today. */
    suggestPlanBeforeScan: planKnown && !hasPlan && flags.scanWithoutPlanOn !== toLocalDate(),
    markWelcomeSeen: () => update({ welcomeSeen: true }),
    dismissChecklist: () => update({ checklistDismissed: true }),
    scanWithoutPlan: () => update({ scanWithoutPlanOn: toLocalDate() }),
  };
}
