'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Toggle } from '@/components/ui/Toggle';
import { useNotifications } from '@/features/notifications/context/NotificationContext';
import { getVapidPublicKey } from '@/lib/vapid-key';

/** Push state as plain words — the browser owns the permission, we only ask for it. */
export function usePushState() {
  const {
    permission,
    requestPermission,
    hasPushSubscription,
    isSubscribing,
    disablePush,
    sendTestPush,
  } = useNotifications();
  const enabled = permission === 'granted' && hasPushSubscription;
  const blocked = permission === 'denied';
  // No VAPID key in the environment means push can't be subscribed to at all —
  // show that rather than a switch that fails with a browser alert.
  const configured = Boolean(getVapidPublicKey());

  return {
    enabled,
    blocked,
    configured,
    isSubscribing,
    sendTestPush,
    /** One switch both ways: subscribe, or unsubscribe and remember it. */
    setEnabled: (next: boolean) => void (next ? requestPermission() : disablePush()),
    state: !configured ? 'Unavailable' : blocked ? 'Blocked' : enabled ? 'On' : 'Off',
    hint: !configured
      ? 'Push notifications are not set up for this build.'
      : blocked
        ? 'Blocked — re-allow notifications in your browser settings.'
        : enabled
          ? 'On — nudges arrive even when FoodCal is closed.'
          : 'Off — turn on to get nudges when FoodCal is closed.',
  };
}

export function PushRow() {
  const { enabled, blocked, configured, isSubscribing, setEnabled, hint } = usePushState();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-subhead font-bold text-fg">Push notifications</p>
        <p className="text-caption text-muted">{hint}</p>
      </div>
      <Toggle
        label="Push notifications"
        checked={enabled}
        busy={isSubscribing}
        disabled={blocked || !configured}
        onChange={setEnabled}
      />
    </div>
  );
}

/** Phone tile version: just the switch and a one-word state. */
export function PushCompact() {
  const { enabled, blocked, configured, isSubscribing, setEnabled, state } = usePushState();

  return (
    <div className="my-auto flex items-center justify-between gap-2">
      <span className="min-w-0 truncate text-subhead font-bold text-fg">{state}</span>
      <Toggle
        label="Push notifications"
        checked={enabled}
        busy={isSubscribing}
        disabled={blocked || !configured}
        onChange={setEnabled}
      />
    </div>
  );
}

export default function RemindersCard() {
  const { enabled, sendTestPush } = usePushState();

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-5">
      <div>
        <h2 className="text-lg font-bold text-fg">Reminders</h2>
        <p className="mt-0.5 text-subhead text-muted">
          Meal and goal nudges from your coach on this device.
        </p>
      </div>

      <PushRow />

      <div className="flex items-center gap-2 border-t border-line pt-3">
        <Link
          href="/notifications"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg transition-colors hover:bg-surface-3"
        >
          Notification centre
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
        {enabled && (
          <button
            type="button"
            onClick={() => void sendTestPush()}
            className="h-10 rounded-xl px-3 text-sm font-bold text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
          >
            Send test
          </button>
        )}
      </div>
    </section>
  );
}
