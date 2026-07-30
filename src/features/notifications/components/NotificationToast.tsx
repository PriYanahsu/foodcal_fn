'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../types';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
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

  // Get icon based on notification type
  const getIcon = () => {
    switch (activeNotification.type) {
      case 'milestone':
        return '🏆';
      case 'coach_advice':
        return '💪';
      case 'motivation':
        return '🔥';
      case 'goal_reminder':
        return '🎯';
      default:
        return '🔔';
    }
  };

  // Get gradient colors based on type
  const getGradient = () => {
    switch (activeNotification.type) {
      case 'milestone':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40';
      case 'coach_advice':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40';
      case 'motivation':
        return 'from-[var(--primary)]/20 to-green-500/20 border-[var(--primary)]/40';
      case 'goal_reminder':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/40';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/40';
    }
  };

  return (
    <AnimatePresence>
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, x: 400, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={handleClick}
          className="fixed z-[100] left-3 right-3 top-[max(0.75rem,env(safe-area-inset-top))] md:left-auto md:right-6 md:w-full md:max-w-md cursor-pointer group isolate"
        >
          <div
            className={`
                        relative overflow-hidden rounded-2xl
                        bg-gradient-to-br ${getGradient()}
                        border backdrop-blur-xl
                        shadow-2xl
                        transition-shadow duration-300
                        hover:shadow-[0_0_30px_rgba(118,185,0,0.25)]
                    `}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 via-transparent to-[var(--primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative p-5 flex gap-4 items-start">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center text-2xl border border-[var(--card-border)]">
                {getIcon()}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-black text-base text-[var(--foreground)] leading-tight">
                    {activeNotification.title}
                  </h4>
                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--surface-strong)]"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed mb-2">
                  {activeNotification.message}
                </p>

                {/* Click hint */}
                <div className="flex items-center gap-1 text-[10px] text-[var(--primary)] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  <SparklesIcon className="w-3 h-3" />
                  <span>Tap to view dashboard</span>
                </div>
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 6, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-[var(--primary)]"
            />

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
