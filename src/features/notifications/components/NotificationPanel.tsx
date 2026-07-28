'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '../context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { PermissionDeniedHelp } from './PermissionDeniedHelp';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, BellIcon } from '@heroicons/react/24/outline';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    removeNotification,
    permission,
    requestPermission,
    hasPushSubscription,
    isSubscribing,
    sendTestPush,
  } = useNotifications();
  const [showHelp, setShowHelp] = useState(false);

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 md:bg-transparent md:pointer-events-none"
              onClick={onClose}
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              className="
                fixed z-[70] isolate
                left-3 right-3 top-[4.5rem]
                md:absolute md:left-auto md:right-0 md:top-full md:mt-3
                md:w-96 md:inset-x-auto
                max-h-[min(80vh,560px)]
                origin-top-right
              "
            >
              {/* Inner shell keeps radius clipped cleanly during scale anim */}
              <div className="h-full max-h-[min(80vh,560px)] flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-[var(--card-bg)]/95 backdrop-blur-xl shadow-2xl">
                <div className="shrink-0 px-4 py-3.5 border-b border-white/10 bg-white/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base leading-tight">Notifications</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'You\'re all caught up'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {permission !== 'granted' && (
                        <>
                          <button
                            type="button"
                            onClick={requestPermission}
                            disabled={isSubscribing || permission === 'denied'}
                            className="text-[11px] font-semibold bg-[var(--primary)] text-black px-2.5 py-1 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {isSubscribing
                              ? 'Enabling...'
                              : permission === 'denied'
                                ? 'Blocked'
                                : 'Enable'}
                          </button>
                          {permission === 'denied' && (
                            <button
                              type="button"
                              onClick={() => setShowHelp(true)}
                              className="text-[11px] text-red-400 hover:text-red-300 underline"
                            >
                              Help
                            </button>
                          )}
                        </>
                      )}
                      {permission === 'granted' && !hasPushSubscription && (
                        <button
                          type="button"
                          onClick={requestPermission}
                          disabled={isSubscribing}
                          className="text-[11px] font-bold bg-[var(--primary)] text-black px-2.5 py-1 rounded-lg disabled:opacity-50"
                        >
                          {isSubscribing ? 'Fixing...' : 'Fix Push'}
                        </button>
                      )}
                      {permission === 'granted' && hasPushSubscription && (
                        <span className="text-[11px] text-green-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          Live
                        </span>
                      )}
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="mt-2.5 text-[11px] text-[var(--primary)] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2 custom-scrollbar min-h-[120px]">
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
                        key="empty-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 px-4 text-center"
                      >
                        <div className="mx-auto w-12 h-12 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center mb-3">
                          <BellIcon className="w-5 h-5 text-gray-500" />
                        </div>
                        <h4 className="font-medium text-sm text-gray-300">No new notifications</h4>
                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto mt-1 leading-relaxed">
                          Check the full page for your history.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="shrink-0 p-3 border-t border-white/10 bg-black/25 flex flex-col gap-2">
                  {permission === 'granted' && hasPushSubscription && (
                    <button
                      type="button"
                      onClick={() => sendTestPush()}
                      disabled={isSubscribing}
                      className="text-xs bg-white/8 hover:bg-white/12 text-white font-semibold py-2 px-3 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Send Test Push
                    </button>
                  )}
                  <Link
                    href="/notifications"
                    onClick={onClose}
                    className="text-center text-xs text-[var(--primary)] hover:underline font-semibold py-1"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <PermissionDeniedHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};
