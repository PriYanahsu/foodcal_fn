'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Toggle } from '@/components/ui/Toggle';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { useNotifications } from '../context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { PermissionDeniedHelp } from './PermissionDeniedHelp';
import { usePushState } from './PushToggleRow';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAllAsRead, markAsRead, removeNotification } =
    useNotifications();
  const { enabled, blocked, configured, isSubscribing, setEnabled, state } = usePushState();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const [showHelp, setShowHelp] = useState(false);

  const unread = notifications.filter((n) => !n.isRead);

  const body = (
    <div className="flex min-h-0 flex-1 flex-col font-ui text-fg">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-tight text-fg">Notifications</h2>
          <p className="mt-0.5 text-caption text-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 px-3 py-1.5 text-caption font-bold text-fg transition-colors hover:bg-surface-3"
          >
            <CheckIcon className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </header>

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="text-subhead font-bold text-fg">Push notifications</p>
          <p className="truncate text-caption text-muted">
            {blocked ? (
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="font-semibold text-danger underline"
              >
                Blocked — how to fix
              </button>
            ) : (
              state
            )}
          </p>
        </div>
        <Toggle
          label="Push notifications"
          checked={enabled}
          busy={isSubscribing}
          disabled={blocked || !configured}
          onChange={setEnabled}
        />
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
        <AnimatePresence initial={false} mode="popLayout">
          {unread.length > 0 ? (
            unread.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onRead={markAsRead}
                onRemove={removeNotification}
                compact
              />
            ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center px-4 py-10 text-center"
            >
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted">
                <BellIcon className="h-5 w-5" />
              </span>
              <p className="text-sm font-bold text-fg">No new notifications</p>
              <p className="mt-1 max-w-[220px] text-caption leading-relaxed text-muted">
                Coach tips and milestones land here as they happen.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="shrink-0 border-t border-line p-3">
        <Link
          href="/notifications"
          onClick={onClose}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 text-sm font-bold text-fg transition-colors hover:bg-surface-3"
        >
          View all notifications
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </footer>
    </div>
  );

  return (
    <>
      {isPhone ? (
        <BottomSheet open={isOpen} onClose={onClose} label="Notifications">
          {/* The sheet supplies its own padding, so the panel drops its side gutters. */}
          <div className="-mx-5 flex h-[60dvh] flex-col">{body}</div>
        </BottomSheet>
      ) : (
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px]"
              />
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                className="absolute right-0 top-full z-[70] mt-3 flex max-h-[min(80vh,560px)] w-96 origin-top-right flex-col overflow-hidden rounded-3xl border border-line bg-surface-1 shadow-[0_32px_80px_rgba(0,0,0,0.55)]"
              >
                {body}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      <PermissionDeniedHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};
