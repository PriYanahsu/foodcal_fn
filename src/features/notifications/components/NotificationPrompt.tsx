'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { BellIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationPrompt: React.FC = () => {
  const { permission, requestPermission, hasPushSubscription, isSubscribing } = useNotifications();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Show if logged in, no push sub yet, and not denied/dismissed
    if (
      user &&
      permission !== 'denied' &&
      !hasPushSubscription &&
      !hasShown &&
      typeof window !== 'undefined'
    ) {
      const dismissed = localStorage.getItem(`notification-prompt-dismissed-${user.id}`);
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, permission, hasPushSubscription, hasShown]);

  const handleEnable = async () => {
    setHasShown(true);
    setIsVisible(false);
    await requestPermission();
  };

  const handleDismiss = () => {
    setHasShown(true);
    setIsVisible(false);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`notification-prompt-dismissed-${user.id}`, 'true');
    }
  };

  if (permission === 'denied' || hasPushSubscription || !user) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--fc-scrim)] backdrop-blur-[2px]"
            onClick={handleDismiss}
          />

          {/* Prompt Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed z-[101] left-3 right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] md:left-auto md:right-4 md:w-96 isolate"
          >
            <div className="overflow-hidden rounded-3xl border border-line bg-surface-1 p-5 font-ui shadow-[var(--fc-shadow-pop)]">
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand-ink">
                  <BellIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold leading-tight text-fg">Turn on reminders?</h3>
                  <p className="mt-1 text-footnote leading-relaxed text-muted">
                    Meal nudges, goal alerts and milestones reach you even when FoodCal is closed.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={handleEnable}
                      disabled={isSubscribing}
                      className="h-11 flex-1 rounded-xl bg-brand text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50"
                    >
                      {isSubscribing ? 'Enabling…' : 'Turn on'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="h-11 rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg-2 transition-colors hover:text-fg"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
