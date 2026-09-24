'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/app/service';
import { getWeights } from '@/app/service/weight.api';
import { useLoggedDays } from '@/features/Nutrition/hooks/useLoggedDays';
import { useNotifications } from '@/features/notifications/context/NotificationContext';
import { useOnboarding } from './useOnboarding';

export type TaskId = 'plan' | 'meal' | 'weigh' | 'reminders';

export interface GettingStartedTask {
  id: TaskId;
  title: string;
  detail: string;
  done: boolean;
}

/** The checklist only greets new accounts — older users never see it appear. */
const SHOW_FOR_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

/** First-week checklist. Every tick is derived from real data, never a manual checkbox. */
export function useGettingStarted() {
  const { userId, hasPlan, fitness, checklistDismissed, dismissChecklist } = useOnboarding();
  const loggedDays = useLoggedDays();
  // Read the clock once per mount; render must stay pure.
  const [now] = useState(() => Date.now());
  const { permission, hasPushSubscription, requestPermission } = useNotifications();

  const { data: weights = [] } = useQuery({
    queryKey: queryKeys.weights(userId ?? ''),
    queryFn: () => getWeights(userId!),
    enabled: !!userId,
  });

  const tasks: GettingStartedTask[] = [
    {
      id: 'plan',
      title: 'Build your plan',
      detail: 'Daily calorie and macro targets',
      done: hasPlan,
    },
    {
      id: 'meal',
      title: 'Scan your first meal',
      detail: 'Snap the plate, get calories and macros',
      done: loggedDays.size > 0,
    },
    {
      id: 'weigh',
      title: 'Log a weigh-in',
      detail: 'Starts your progress chart',
      done: weights.length > 0,
    },
  ];
  // A blocked permission can't be fixed from here, so don't show a task that can't be finished.
  if (permission !== 'denied') {
    tasks.push({
      id: 'reminders',
      title: 'Turn on meal reminders',
      detail: 'A nudge when it’s time to log',
      done: hasPushSubscription,
    });
  }

  const doneCount = tasks.filter((task) => task.done).length;
  const createdAt = fitness?.createdAt ? new Date(fitness.createdAt).getTime() : NaN;
  const isNewAccount = Number.isFinite(createdAt) && now - createdAt < SHOW_FOR_DAYS * DAY_MS;

  return {
    tasks,
    doneCount,
    total: tasks.length,
    visible: hasPlan && isNewAccount && !checklistDismissed && doneCount < tasks.length,
    dismiss: dismissChecklist,
    requestPermission,
  };
}
