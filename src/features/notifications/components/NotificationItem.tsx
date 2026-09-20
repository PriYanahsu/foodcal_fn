'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BellAlertIcon,
  FireIcon,
  InformationCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  TrophyIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AppNotification, NotificationType } from '../types';

interface NotificationItemProps {
  notification: AppNotification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  showRemove?: boolean;
  compact?: boolean;
}

/** One tone per kind, from the app palette. Class names stay literal for Tailwind. */
const META: Record<NotificationType, { icon: React.ReactNode; chip: string }> = {
  goal_reminder: {
    icon: <BellAlertIcon className="h-5 w-5" />,
    chip: 'bg-carbs/15 text-carbs',
  },
  coach_advice: {
    icon: <SparklesIcon className="h-5 w-5" />,
    chip: 'bg-brand/15 text-brand-ink',
  },
  milestone: {
    icon: <TrophyIcon className="h-5 w-5" />,
    chip: 'bg-warn/15 text-warn',
  },
  system: {
    icon: <InformationCircleIcon className="h-5 w-5" />,
    chip: 'bg-info/15 text-info',
  },
  motivation: {
    icon: <FireIcon className="h-5 w-5" />,
    chip: 'bg-protein/15 text-protein',
  },
};

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onRemove,
  showRemove = true,
  compact = false,
}) => {
  const meta = META[notification.type];
  const unread = !notification.isRead;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => unread && onRead(notification.id)}
      className={`relative flex gap-3 overflow-hidden rounded-2xl border transition-colors ${
        compact ? 'p-3' : 'p-4'
      } ${unread ? 'border-line-strong bg-surface-2' : 'border-line bg-surface-1'}`}
    >
      {unread && (
        <span
          aria-hidden="true"
          className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-brand"
        />
      )}

      <span
        className={`flex shrink-0 items-center justify-center rounded-xl ${meta.chip} ${
          compact ? 'h-9 w-9' : 'h-10 w-10'
        } ${unread ? 'ml-1.5' : ''}`}
      >
        {meta.icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`min-w-0 truncate text-sm font-bold leading-snug ${
              unread ? 'text-fg' : 'text-fg-2'
            }`}
          >
            {notification.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-caption tabular-nums text-muted">
              {relativeTime(notification.timestamp)}
            </span>
            {showRemove && (
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(notification.id);
                }}
                className="-mr-1 rounded-lg p-1 text-muted transition-colors hover:bg-surface-3 hover:text-fg"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <p
          className={`mt-1 text-footnote leading-relaxed text-muted ${
            compact ? 'line-clamp-2' : 'line-clamp-3'
          }`}
        >
          {notification.message}
        </p>

        {notification.suggestion && !compact && (
          <p className="mt-2.5 flex items-start gap-1.5 rounded-xl border border-brand/25 bg-brand/10 px-2.5 py-2 text-caption leading-snug text-brand-ink">
            <LightBulbIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0">{notification.suggestion}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
};
