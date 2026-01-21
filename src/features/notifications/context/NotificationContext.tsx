'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification, NotificationContextType, NotificationType } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDailyStats } from '@/features/dashboard/hooks/useDailyStats';
import { createClient } from '@/lib/supabase/client';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const { user } = useAuth();
    const { stats, loading: statsLoading } = useDailyStats();
    const supabase = createClient();

    // Load from localStorage on mount
    useEffect(() => {
        if (!user) return;
        const saved = localStorage.getItem(`notifications_${user.id}`);
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse notifications', e);
            }
        }
    }, [user]);

    // Save to localStorage whenever notifications change
    useEffect(() => {
        if (!user) return;
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }, [notifications, user]);

    // Request notification permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, []);

    const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotif: AppNotification = {
            ...notif,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep last 50

        // Trigger System Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotif.title, {
                body: newNotif.message,
                icon: '/icons/icon-192x192.png'
            });
        }
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Logic to check if user is behind schedule
    useEffect(() => {
        if (!user || statsLoading) return;

        const checkProgress = async () => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!profile || !profile.daily_calorie_target) return;

            const target = profile.daily_calorie_target;
            const current = stats.calories;
            const now = new Date();
            const hour = now.getHours();
            const remaining = Math.max(0, target - current);

            // Check if this notification was already sent today
            const todayStr = now.toLocaleDateString('en-CA');
            const hasSentToday = notifications.some(n =>
                n.timestamp.startsWith(todayStr) && n.type === 'goal_reminder'
            );

            if (hasSentToday) return;

            let conditionMet = false;
            let message = '';
            let title = 'Wellness Update ✨';
            const objective = profile.goal?.toLowerCase() || 'maintain';

            // WEIGHT GAIN LOGIC (Behind Schedule) - Focus on momentum and fueling
            if (objective.includes('gain')) {
                if (hour >= 15 && hour < 18 && current < target * 0.4) {
                    conditionMet = true;
                    title = 'Fueling Your Progress 🚀';
                    message = `You're doing great! You've reached 40% of your goal—just ${remaining} calories away from your afternoon target!`;
                } else if (hour >= 18 && hour < 21 && current < target * 0.6) {
                    conditionMet = true;
                    title = 'Powering Through ✨';
                    message = `Almost there! You've nailed 60% of your goal. A hearty dinner will get you even closer to your peak performance!`;
                } else if (hour >= 21 && current < target * 0.9) {
                    conditionMet = true;
                    title = 'Finishing Strong 💪';
                    message = `Incredible effort today! You’re just ${remaining} calories away from your target. One last nutrient-rich snack will help you cross the finish line!`;
                }
            }
            // WEIGHT LOSS LOGIC (Limit Alert) - Focus on discipline and mindfulness
            else if (objective.includes('loss') || objective.includes('lose')) {
                if (current > target * 0.9 && current < target) {
                    conditionMet = true;
                    title = 'Mindful Choices 🌿';
                    message = `You're 90% of the way to your limit! You've stayed so disciplined today—choose your next bite mindfully to finish strong.`;
                } else if (current >= target) {
                    conditionMet = true;
                    title = 'Limit Mastered! 🏆';
                    message = `Perfect execution! You've hit your target exactly. Celebrate your discipline today—you’re crushing it!`;
                }
            }
            // GENERIC MAINTAIN/DEFAULT - Focus on balance
            else {
                if (hour >= 20 && current < target * 0.5) {
                    conditionMet = true;
                    title = 'Stay Nourished 🥗';
                    message = `You've reached your half-way mark! Keep that momentum going so your body has all the nutrients it needs to shine tomorrow.`;
                }
            }

            if (conditionMet) {
                // Check if this specific TITLE was already sent today to avoid repeating
                const hasSentRecently = notifications.some(n =>
                    n.timestamp.startsWith(todayStr) && n.title === title
                );
                if (hasSentRecently) return;

                let dynamicAdvice = "Our AI coach has a supportive suggestion for your next meal!";

                try {
                    const statsForAi = {
                        gender: profile.gender || 'unknown',
                        age: profile.age || 25,
                        height: profile.height || 170,
                        weight: profile.weight || 70,
                        activity_level: profile.activity_level || 'moderate'
                    };
                    const goalsForAi = {
                        objective: profile.goal || 'maintain',
                        target_weight: profile.target_weight || 70,
                        target_date: profile.target_date || new Date().toISOString()
                    };

                    const aiRes = await fetch('/api/fitness-consultant', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ stats: statsForAi, goals: goalsForAi, mode: 'supportive' })
                    });
                    const aiData = await aiRes.json();
                    if (aiData.data && aiData.data.advice) {
                        dynamicAdvice = aiData.data.advice;
                    }
                } catch (e) {
                    console.error('Failed to fetch dynamic AI advice', e);
                }

                addNotification({
                    title,
                    message,
                    type: 'goal_reminder',
                    suggestion: dynamicAdvice
                });
            }
        };

        const interval = setInterval(checkProgress, 1800000);
        checkProgress();

        return () => clearInterval(interval);
    }, [user, stats, statsLoading, notifications, addNotification, supabase]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            removeNotification,
            addNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
