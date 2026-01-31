'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification, NotificationContextType, NotificationType } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { getVapidPublicKey } from '@/lib/vapid-key';

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
            } as any, (payload: any) => {
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
    const [hasPushSubscription, setHasPushSubscription] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);

    // Check for existing push subscription
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && user) {
            navigator.serviceWorker.ready.then(async (registration) => {
                const subscription = await registration.pushManager.getSubscription();
                setHasPushSubscription(!!subscription);
            });
        }
    }, [user]);

    const requestPermission = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            alert('Notifications are not supported in this browser.');
            return;
        }

        setIsSubscribing(true);

        try {
            // First, ensure service worker is registered
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    // Wait for service worker to be ready
                    await navigator.serviceWorker.ready;
                } catch (swError) {
                    console.error('Service worker registration failed:', swError);
                    // Continue anyway - some browsers might still work
                }
            }

            // Request notification permission
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result !== 'granted') {
                setIsSubscribing(false);
                if (result === 'denied') {
                    alert('Notification permission was denied. Please enable it in your browser settings.');
                }
                return;
            }

            // Check if push notifications are supported
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    
                    // Get VAPID public key - try multiple ways for mobile compatibility
                    const vapidPublicKey = getVapidPublicKey();
                    
                    if (!vapidPublicKey) {
                        console.error('VAPID public key not found');
                        alert('Push notification configuration error. Please make sure VAPID keys are set in environment variables.');
                        setIsSubscribing(false);
                        return;
                    }

                    // Convert VAPID key to Uint8Array
                    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

                    // Subscribe to push notifications
                    const pushSubscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: applicationServerKey as any,
                    });

                    // Prepare subscription data
                    const subscriptionData = {
                        endpoint: pushSubscription.endpoint,
                        keys: {
                            p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
                            auth: arrayBufferToBase64(pushSubscription.getKey('auth')!),
                        },
                    };

                    // Save subscription to backend
                    const response = await fetch('/api/push-subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(subscriptionData),
                    });

                    if (response.ok) {
                        setHasPushSubscription(true);
                        // Show success notification
                        if (Notification.permission === 'granted') {
                            new Notification('Push Notifications Enabled! 🎉', {
                                body: 'You will now receive notifications even when the app is closed!',
                                icon: '/icons/icon-192x192.png',
                                badge: '/icons/icon-192x192.png',
                                tag: 'push-enabled',
                            });
                        }
                    } else {
                        const errorData = await response.json();
                        console.error('Failed to save subscription:', errorData);
                        alert('Failed to enable push notifications. Please try again.');
                    }
                } catch (pushError: any) {
                    console.error('Push subscription error:', pushError);
                    let errorMessage = 'Failed to enable push notifications. ';
                    
                    if (pushError.message?.includes('VAPID')) {
                        errorMessage += 'Configuration error.';
                    } else if (pushError.message?.includes('permission')) {
                        errorMessage += 'Permission denied.';
                    } else {
                        errorMessage += 'Please try again.';
                    }
                    
                    alert(errorMessage);
                }
            } else {
                // Fallback: regular notifications
                if (Notification.permission === 'granted') {
                    new Notification('Notifications Enabled! 🎉', {
                        body: 'You will now receive updates synced with your account.',
                        icon: '/icons/icon-192x192.png'
                    });
                }
            }
        } catch (error: any) {
            console.error('Notification permission error:', error);
            alert('An error occurred while enabling notifications. Please try again.');
        } finally {
            setIsSubscribing(false);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Helper functions
    function urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        const rawData = atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    function arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

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
            requestPermission,
            hasPushSubscription,
            isSubscribing,
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
