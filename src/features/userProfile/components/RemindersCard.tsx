'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { PushRow, usePushState } from '@/features/notifications/components/PushToggleRow';

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
