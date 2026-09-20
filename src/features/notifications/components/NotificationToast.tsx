'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../types';
import { BellAlertIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export const NotificationToast = () => {
  const { notifications, markAsRead } = useNotifications();
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    // When notifications change, if the latest one is new and unread, show it
    if (notifications.length > 0) {
      const latest = notifications[0];
      const now = new Date();
      const notifTime = new Date(latest.timestamp);
      const diff = now.getTime() - notifTime.getTime();

      // Show if it's new (less than 10 seconds old), unread, and not already shown
      if (diff < 10000 && !latest.isRead && !shownIds.has(latest.id)) {
        setActiveNotification(latest);
        setShownIds((prev) => new Set(prev).add(latest.id));

        // Auto-dismiss after 6 seconds
        const timer = setTimeout(() => {
          setActiveNotification(null);
        }, 6000);

        return () => clearTimeout(timer);
      }
    }
  }, [notifications, shownIds]);

  const handleClick = () => {
    if (activeNotification) {
      // Mark as read
      markAsRead(activeNotification.id);
      // Navigate to dashboard
      router.push('/');
      // Close notification
      setActiveNotification(null);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeNotification) {
      markAsRead(activeNotification.id);
    }
    setActiveNotification(null);
  };

  if (!activeNotification) return null;

  const TONES: Record<string, string> = {
    milestone: 'bg-warn/15 text-warn',
    coach_advice: 'bg-brand/15 text-brand-ink',
    motivation: 'bg-protein/15 text-protein',
    goal_reminder: 'bg-carbs/15 text-carbs',
    system: 'bg-info/15 text-info',
  };
  const tone = TONES[activeNotification.type] ?? TONES.system;

  return (
    <AnimatePresence>
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, x: 400, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={handleClick}
          className="group fixed left-3 right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[100] isolate cursor-pointer md:left-auto md:right-6 md:w-full md:max-w-sm"
        >
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-1 font-ui shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-start gap-3 p-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
              >
                <BellAlertIcon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="min-w-0 text-sm font-bold leading-snug text-fg">
                    {activeNotification.title}
                  </h3>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss"
                    className="-mr-1 -mt-0.5 shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 line-clamp-3 text-footnote leading-relaxed text-fg-2">
                  {activeNotification.message}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-caption font-bold text-brand-ink">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Tap to open
                </span>
              </div>
            </div>

            <motion.span
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 6, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-brand"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
