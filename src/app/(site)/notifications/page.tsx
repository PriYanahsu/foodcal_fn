'use client';

import React, { useMemo } from 'react';
import { useNotifications } from '@/features/notifications/context/NotificationContext';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

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

  const clearRead = () => {
    notifications.filter((n) => n.isRead).forEach((n) => removeNotification(n.id));
  };

  const readCount = notifications.filter((n) => n.isRead).length;

  return (
    <div className="page-container space-y-6 sm:space-y-8 max-w-2xl pb-24 lg:pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shrink-0">
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <span className="truncate">Notifications</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-2 pl-0 sm:pl-[3.75rem]">
            Goal alerts, milestones, and AI coaching tips.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="btn-secondary flex items-center gap-1.5 py-2 px-3 h-9 text-xs"
              >
                <CheckIcon className="w-4 h-4" />
                Mark all read
              </button>
            )}
            {readCount > 0 && (
              <button
                type="button"
                onClick={clearRead}
                className="btn-secondary flex items-center gap-1.5 py-2 px-3 h-9 text-xs"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Clear read
              </button>
            )}
          </div>
        )}
      </header>

      {notifications.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface)] border border-[var(--card-border)] px-3 py-1">
            {unreadCount > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                {unreadCount} unread
              </>
            ) : (
              'All caught up'
            )}
          </span>
          <span>{notifications.length} total</span>
        </div>
      )}

      <section className="space-y-6 min-h-[320px]">
        <AnimatePresence initial={false} mode="popLayout">
          {notifications.length > 0 ? (
            grouped.map(([label, items]) => (
              <motion.div
                key={label}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5"
              >
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1">
                  {label}
                </h2>
                <div className="space-y-2.5">
                  {items.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onRead={markAsRead}
                      onRemove={removeNotification}
                      showRemove
                    />
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--surface)] flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] ring-1 ring-white/10 flex items-center justify-center mb-5">
                <BellIcon className="w-7 h-7 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold mb-1.5">No notifications yet</h3>
              <p className="text-[var(--text-muted)] max-w-xs text-sm leading-relaxed">
                When the AI coach has advice or you hit a milestone, it&apos;ll show up here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
