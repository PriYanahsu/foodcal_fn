'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationPrompt: React.FC = () => {
    const { permission, requestPermission, hasPushSubscription, isSubscribing } = useNotifications();
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        // Show prompt if:
        // 1. User is logged in
        // 2. Permission is default (not granted or denied)
        // 3. No push subscription yet
        // 4. We haven't shown it in this session
        if (
            user &&
            permission === 'default' &&
            !hasPushSubscription &&
            !hasShown &&
            typeof window !== 'undefined'
        ) {
            // Check if user previously dismissed
            const dismissed = localStorage.getItem(`notification-prompt-dismissed-${user.id}`);
            if (!dismissed) {
                // Wait 2 seconds after page load to show prompt
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
        // Store dismissal in localStorage
        if (user && typeof window !== 'undefined') {
            localStorage.setItem(`notification-prompt-dismissed-${user.id}`, 'true');
        }
    };

    // Don't show if permission is already granted or denied, or if user has push subscription
    if (permission !== 'default' || hasPushSubscription || !user) {
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
                        className="fixed inset-0 bg-black/50 z-[100]"
                        onClick={handleDismiss}
                    />
                    
                    {/* Prompt Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[101]"
                    >
                        <div className="glass-card border border-[var(--primary)]/30 p-5 rounded-2xl shadow-2xl bg-black/90 backdrop-blur-xl">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                                        <BellIcon className="w-6 h-6 text-[var(--primary)]" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-base mb-2 text-white">
                                        Enable Push Notifications? 🔔
                                    </h4>
                                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                                        Get notified about your nutrition goals, meal reminders, and achievements even when you're away from the app!
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleEnable}
                                            disabled={isSubscribing}
                                            className="flex-1 bg-[var(--primary)] text-black text-sm font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubscribing ? 'Enabling...' : 'Yes, Enable'}
                                        </button>
                                        <button
                                            onClick={handleDismiss}
                                            className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
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
