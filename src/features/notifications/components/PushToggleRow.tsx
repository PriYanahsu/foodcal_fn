'use client';

import { Toggle } from '@/components/ui/Toggle';
import { getVapidPublicKey } from '@/lib/vapid-key';
import { useNotifications } from '../context/NotificationContext';

/** Push state in plain words — the browser owns the permission, we only ask for it. */
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

/** Full row: name, state sentence and the switch. */
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
