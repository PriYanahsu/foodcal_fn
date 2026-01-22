'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const NotificationToast = () => {
    const { notifications } = useNotifications();
    const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

    useEffect(() => {
        // When notifications change, if the latest one is new and unread, show it
        if (notifications.length > 0) {
            const latest = notifications[0];
            // Simple check: if it's less than 5 seconds old, show it.
            // A better way would be to have an event, but this works for state-based.
            const now = new Date();
            const notifTime = new Date(latest.timestamp);
            const diff = now.getTime() - notifTime.getTime();

            if (diff < 5000 && !latest.isRead) {
                setActiveNotification(latest);
                const timer = setTimeout(() => setActiveNotification(null), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [notifications]);

    if (!activeNotification) return null;

    return (
        <AnimatePresence>
            {activeNotification && (
                <motion.div
                    initial={{ opacity: 0, y: -20, right: 20 }}
                    animate={{ opacity: 1, y: 0, right: 20 }}
                    exit={{ opacity: 0, y: -20, right: 20 }}
                    className="fixed top-20 right-4 md:right-8 z-[100] max-w-sm w-full bg-[#1a1a1a]/90 backdrop-blur-md border border-[var(--primary)]/30 text-white p-4 rounded-xl shadow-2xl flex gap-3 items-start"
                >
                    <div className="text-2xl">
                        {activeNotification.type === 'goal_reminder' ? '🎯' : '🔔'}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-[var(--primary)]">{activeNotification.title}</h4>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{activeNotification.message}</p>
                    </div>
                    <button
                        onClick={() => setActiveNotification(null)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    {/* Progress bar for auto-dismiss */}
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1 bg-[var(--primary)]/50 rounded-b-xl"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
