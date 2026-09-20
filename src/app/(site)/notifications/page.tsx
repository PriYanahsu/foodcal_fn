'use client';

import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/features/notifications/context/NotificationContext';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { PushRow } from '@/features/notifications/components/PushToggleRow';

function dayLabel(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead, markAsRead, removeNotification } =
    useNotifications();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof notifications>();
    for (const n of notifications) {
      const key = dayLabel(n.timestamp);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    }
    return Array.from(map.entries());
  }, [notifications]);

  const readCount = notifications.filter((n) => n.isRead).length;

  const clearRead = () => {
    notifications.filter((n) => n.isRead).forEach((n) => removeNotification(n.id));
  };

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-4 bg-canvas px-4 py-4 pb-8 font-ui text-fg md:gap-5 md:px-8 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-large-title font-bold tracking-[-0.02em] text-fg">
            Notifications
          </h1>
          <p className="mt-1 text-subhead text-muted">
            {notifications.length === 0
              ? 'Coach tips and milestones land here.'
              : unreadCount > 0
                ? `${unreadCount} unread · ${notifications.length} total`
                : `All caught up · ${notifications.length} total`}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg transition-colors hover:bg-surface-3"
              >
                <CheckIcon className="h-4 w-4" />
                Mark all read
              </button>
            )}
            {readCount > 0 && (
              <button
                type="button"
                onClick={clearRead}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <TrashIcon className="h-4 w-4" />
                Clear read
              </button>
            )}
          </div>
        )}
      </header>

      <section className="rounded-3xl border border-line bg-surface-1 p-4 md:p-5">
        <PushRow />
      </section>

      <AnimatePresence initial={false} mode="popLayout">
        {notifications.length > 0 ? (
          grouped.map(([label, items]) => (
            <motion.section
              key={label}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2.5"
            >
              <h2 className="px-1 text-caption font-bold uppercase tracking-wide text-muted">
                {label}
              </h2>
              {items.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={markAsRead}
                  onRemove={removeNotification}
                  showRemove
                />
              ))}
            </motion.section>
          ))
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center"
          >
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-line bg-surface-2 text-muted">
              <BellIcon className="h-7 w-7" />
            </span>
            <h2 className="text-lg font-bold text-fg">No notifications yet</h2>
            <p className="mt-1.5 max-w-xs text-footnote leading-relaxed text-muted">
              When your coach has advice or you hit a milestone, it shows up here.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
