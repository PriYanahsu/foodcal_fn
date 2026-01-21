'use client';

import React from 'react';
import Link from 'next/link';
import { useNotifications } from '../context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markAllAsRead, markAsRead, removeNotification } = useNotifications();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[60] md:hidden"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed md:absolute right-4 top-20 md:top-full md:mt-4 w-[calc(100vw-32px)] md:w-96 max-h-[80vh] z-[70] flex flex-col glass-card border-white/20 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div>
                                <h3 className="font-bold text-lg">Notifications</h3>
                                <p className="text-xs text-gray-400">{unreadCount} unread messages</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 font-medium"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[100px]">
                            <AnimatePresence initial={false} mode="popLayout">
                                {notifications.filter(n => !n.isRead).length > 0 ? (
                                    notifications.filter(n => !n.isRead).map(notif => (
                                        <NotificationItem
                                            key={notif.id}
                                            notification={notif}
                                            onRead={markAsRead}
                                            onRemove={removeNotification}
                                        />
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-10 text-center"
                                    >
                                        <div className="text-4xl mb-3">🔔</div>
                                        <h4 className="font-semibold text-gray-300">No new notifications</h4>
                                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto mt-1">
                                            All caught up! Check the notifications section for your history.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/10 bg-black/20 text-center flex flex-col gap-2">
                            <Link
                                href="/notifications"
                                onClick={onClose}
                                className="text-xs text-[var(--primary)] hover:underline font-bold"
                            >
                                View All Notifications
                            </Link>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                AI Fitness Assistant
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
