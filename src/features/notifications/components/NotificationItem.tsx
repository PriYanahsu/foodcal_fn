'use client';

import React from 'react';
import { AppNotification, NotificationType } from '../types';
import { motion } from 'framer-motion';
import {
  BellAlertIcon,
  SparklesIcon,
  TrophyIcon,
  InformationCircleIcon,
  XMarkIcon,
  FireIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

interface NotificationItemProps {
  notification: AppNotification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  showRemove?: boolean;
  compact?: boolean;
}

const iconMeta: Record<
  NotificationType,
  { icon: React.ReactNode; bg: string; ring: string }
> = {
  goal_reminder: {
    icon: <BellAlertIcon className="w-5 h-5 text-orange-400" />,
    bg: 'bg-orange-400/10',
    ring: 'ring-orange-400/20',
  },
  coach_advice: {
    icon: <SparklesIcon className="w-5 h-5 text-[var(--primary)]" />,
    bg: 'bg-[var(--primary)]/10',
    ring: 'ring-[var(--primary)]/20',
  },
  milestone: {
    icon: <TrophyIcon className="w-5 h-5 text-yellow-400" />,
    bg: 'bg-yellow-400/10',
    ring: 'ring-yellow-400/20',
  },
  system: {
    icon: <InformationCircleIcon className="w-5 h-5 text-blue-400" />,
    bg: 'bg-blue-400/10',
    ring: 'ring-blue-400/20',
  },
  motivation: {
    icon: <FireIcon className="w-5 h-5 text-red-400" />,
    bg: 'bg-red-400/10',
    ring: 'ring-red-400/20',
  },
};

function formatRelativeTime(timestamp: string): string {
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
  const meta = iconMeta[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="relative isolate"
      onClick={() => !notification.isRead && onRead(notification.id)}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border transition-colors duration-200
          ${compact ? 'p-3 sm:p-3.5' : 'p-3.5 sm:p-4'}
          ${
            notification.isRead
              ? 'bg-[var(--card-bg)] border-[var(--card-border)] opacity-80'
              : 'bg-[var(--card-bg)] border-[var(--card-border)] active:border-[var(--primary)]/30'
          }
        `}
      >
        {!notification.isRead && (
          <span
            aria-hidden
            className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-[var(--primary)]"
          />
        )}

        <div className={`flex gap-3 ${!notification.isRead ? 'pl-1.5' : ''}`}>
          <div
            className={`
              shrink-0 flex items-center justify-center rounded-xl ring-1
              ${compact ? 'w-9 h-9' : 'w-10 h-10'}
              ${meta.bg} ${meta.ring}
            `}
          >
            {meta.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h4
                    className={`text-sm font-semibold truncate leading-snug ${
                      notification.isRead ? 'text-[var(--text-muted)]' : 'text-[var(--foreground)]'
                    }`}
                  >
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  )}
                </div>
                <p
                  className={`text-xs text-[var(--text-muted)] mt-1 leading-relaxed ${
                    compact ? 'line-clamp-2' : 'line-clamp-3'
                  }`}
                >
                  {notification.message}
                </p>
              </div>

              {showRemove && (
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(notification.id);
                  }}
                  className="shrink-0 -mr-1 -mt-0.5 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-strong)] transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {notification.suggestion && !compact && (
              <div className="mt-2.5 flex items-start gap-1.5 py-2 px-2.5 rounded-xl bg-[var(--primary)]/8 text-[var(--primary)] text-[11px] leading-snug border border-[var(--primary)]/15">
                <LightBulbIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="min-w-0">{notification.suggestion}</span>
              </div>
            )}

            <p className="text-[10px] text-[var(--text-muted)] mt-2 tabular-nums">
              {formatRelativeTime(notification.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
