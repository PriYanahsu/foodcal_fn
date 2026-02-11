'use client';

import React from 'react';
import { useNotifications } from '@/features/notifications/context/NotificationContext';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function NotificationsPage() {
    const { notifications, unreadCount, markAllAsRead, markAsRead, removeNotification } = useNotifications();

    return (
        <div className="page-container space-y-8 max-w-4xl">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-[var(--text-muted)] text-sm">
                        Stay updated on your calorie goals and AI coaching.
                    </p>
                </div>

                {notifications.length > 0 && (
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="btn-secondary flex items-center gap-2 py-2 px-4 h-10 border-[var(--primary)]/30 text-[var(--primary)] text-xs"
                            >
                                <CheckIcon className="w-4 h-4" />
                                Mark All Read
                            </button>
                        )}
                    </div>
                )}
            </header>

            <section className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                        Recent Updates {unreadCount > 0 && `(${unreadCount} new)`}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                        Showing last {notifications.length} notifications
                    </span>
                </div>

                <div className="p-4 space-y-4 min-h-[400px]">
                    <AnimatePresence initial={false} mode="popLayout">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} className="relative group">
                                    <NotificationItem
                                        notification={notif}
                                        onRead={markAsRead}
                                        onRemove={removeNotification}
                                        showRemove={false}
                                    />
                                    {/* Additional full-page interactions could go here */}
                                </div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">
                                    🔔
                                </div>
                                <h3 className="text-xl font-bold mb-2">Clean Slate!</h3>
                                <p className="text-[var(--text-muted)] max-w-xs mx-auto text-sm">
                                    Your notification center is empty. We'll alert you here when the AI Coach has advice for you.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-4 bg-black/20 border-t border-white/5 flex justify-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                        Powered by Gemini AI Engine
                    </p>
                </div>
            </section>
        </div>
    );
}
