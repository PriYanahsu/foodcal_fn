'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification, NotificationContextType, NotificationType } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const { user } = useAuth();
    const supabase = createClient();

    // 1. Load from Supabase DB on mount
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) {
                const mapped: AppNotification[] = data.map(n => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    type: n.type as NotificationType,
                    timestamp: n.created_at,
                    isRead: n.is_read,
                    suggestion: n.suggestion
                }));
                setNotifications(mapped);
            }
        };

        fetchNotifications();

        // 2. Realtime Subscription
        const channel = supabase
            .channel('notifications_realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                const newRec = payload.new;
                const newNotif: AppNotification = {
                    id: newRec.id,
                    title: newRec.title,
                    message: newRec.message,
                    type: newRec.type as NotificationType,
                    timestamp: newRec.created_at,
                    isRead: newRec.is_read,
                    suggestion: newRec.suggestion
                };

                setNotifications(prev => [newNotif, ...prev]);

                // Trigger System Notification
                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                    const showOptions = {
                        body: newNotif.message,
                        icon: '/icons/icon-192x192.png',
                        badge: '/icons/icon-192x192.png'
                    };

                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.showNotification(newNotif.title, showOptions);
                        });
                    } else {
                        new Notification(newNotif.title, showOptions);
                    }
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                const updatedRec = payload.new;
                setNotifications(prev => prev.map(n => n.id === updatedRec.id ? {
                    ...n,
                    isRead: updatedRec.is_read
                } : n));
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, supabase]);

    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result === 'granted') {
                new Notification('Notifications Enabled! 🎉', {
                    body: 'You will now receive updates synced with your account.',
                    icon: '/icons/icon-192x192.png'
                });
            }
        }
    }, []);

    const addNotification = useCallback(async (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
        // Insert into DB. Realtime will handle the state update and UI trigger.
        if (!user) return;

        await supabase.from('notifications').insert({
            user_id: user.id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            suggestion: notif.suggestion,
            is_read: false
        });

    }, [user, supabase]);

    const markAsRead = useCallback(async (id: string) => {
        // Optimistic
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

        // DB Update
        if (user) {
            await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        }
    }, [user, supabase]);

    const markAllAsRead = useCallback(async () => {
        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        // DB Update
        if (user) {
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
        }
    }, [user, supabase]);

    const removeNotification = useCallback(async (id: string) => {
        // Optimistic
        setNotifications(prev => prev.filter(n => n.id !== id));

        // DB Update
        if (user) {
            await supabase.from('notifications').delete().eq('id', id);
        }
    }, [user, supabase]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            removeNotification,
            addNotification,
            permission,
            requestPermission
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
