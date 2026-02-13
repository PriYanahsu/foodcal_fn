'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification, NotificationContextType, NotificationType } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { getVapidPublicKey } from '@/lib/vapid-key';
import { BRAND_ASSETS } from '@/lib/brand-config';

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
        const mapped: AppNotification[] = data.map(
          (n: {
            id: any;
            title: any;
            message: any;
            type: string;
            created_at: any;
            is_read: any;
            suggestion: any;
          }) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type as NotificationType,
            timestamp: n.created_at,
            isRead: n.is_read,
            suggestion: n.suggestion,
          })
        );
        setNotifications(mapped);
      }
    };

    fetchNotifications();

    // 2. Realtime Subscription
    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: any }) => {
          const newRec = payload.new;
          const newNotif: AppNotification = {
            id: newRec.id,
            title: newRec.title,
            message: newRec.message,
            type: newRec.type as NotificationType,
            timestamp: newRec.created_at,
            isRead: newRec.is_read,
            suggestion: newRec.suggestion,
          };

          setNotifications((prev) => [newNotif, ...prev]);

          // Trigger System Notification
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            const showOptions = {
              body: newNotif.message,
              icon: '/foodCalLogo.jpeg',
              badge: '/foodCalLogo.jpeg',
            };

            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(newNotif.title, showOptions);
              });
            } else {
              new Notification(newNotif.title, showOptions);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: any }) => {
          const updatedRec = payload.new;
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedRec.id
                ? {
                    ...n,
                    isRead: updatedRec.is_read,
                  }
                : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      // Check current permission first
      const currentPermission = Notification.permission;

      // If already denied, we can't request again - show helpful message
      if (currentPermission === 'denied') {
        setIsSubscribing(false);
        setPermission('denied');

        // Detect device type for better guidance
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        let message = 'Notification permission was previously denied.\n\n';

        if (isIOS) {
          message += 'To enable on iOS:\n';
          message += '1. Tap the Share button (square with arrow)\n';
          message += '2. Select "Add to Home Screen"\n';
          message += '3. Open the app from home screen\n';
          message += '4. Then enable notifications\n\n';
          message += 'Or go to: Settings > Safari > Website Settings > Notifications';
        } else if (isAndroid) {
          message += 'To enable on Android:\n';
          message += '1. Tap the menu (3 dots) in browser\n';
          message += '2. Go to Settings > Site Settings\n';
          message += '3. Find this website\n';
          message += '4. Enable Notifications';
        } else {
          message += 'To enable:\n';
          message += '1. Click the lock icon in address bar\n';
          message += '2. Change Notifications to "Allow"\n';
          message += '3. Refresh the page';
        }

        alert(message);
        return;
      }

      // Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setIsSubscribing(false);
        if (result === 'denied') {
          // User just denied - provide immediate guidance
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isAndroid = /Android/.test(navigator.userAgent);

          let message = 'Notifications were blocked.\n\n';

          if (isIOS) {
            message += 'On iOS, you need to:\n';
            message += '1. Add this site to Home Screen first\n';
            message += '2. Then enable notifications\n\n';
            message += 'Or check: Settings > Safari > Website Settings';
          } else if (isAndroid) {
            message += 'To enable:\n';
            message += 'Browser Menu (⋮) > Settings > Site Settings > Notifications';
          } else {
            message += 'Click the lock icon in address bar and allow notifications.';
          }

          alert(message);
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
            alert(
              'Push notification configuration error. Please make sure VAPID keys are set in environment variables.'
            );
            setIsSubscribing(false);
            return;
          }

          // Convert VAPID key to Uint8Array
          const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

          // Subscribe to push notifications
          let pushSubscription;
          try {
            pushSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: applicationServerKey as any,
            });
          } catch (subErr: any) {
            console.error('Subscription call failed, trying reset:', subErr);
            // Try to clean up existing sub and try one more time
            const existingSub = await registration.pushManager.getSubscription();
            if (existingSub) {
              await existingSub.unsubscribe();
            }
            pushSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: applicationServerKey as any,
            });
          }

          // Prepare subscription data
          const subscriptionData = {
            endpoint: pushSubscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(pushSubscription.getKey('auth')!),
            },
          };

          console.log('Push subscription created, saving to backend...');

          // Save subscription to backend
          const response = await fetch('/api/push-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriptionData),
          });

          if (response.ok) {
            setHasPushSubscription(true);
            console.log('Push subscription saved successfully');
            // Show success notification
            if (Notification.permission === 'granted') {
              new Notification('Push Notifications Enabled! 🎉', {
                body: 'You will now receive notifications even when the app is closed!',
                icon: BRAND_ASSETS.logo,
                badge: BRAND_ASSETS.logo,
                tag: 'push-enabled',
              });
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to save subscription:', errorData);
            alert(`Server Error: ${errorData.error || 'Failed to sync with account'}`);
            setIsSubscribing(false);
          }
        } catch (pushError: any) {
          console.error('Push subscription error details:', pushError);
          let errorMessage = 'Failed to enable push notifications. ';

          if (pushError.name === 'NotAllowedError') {
            errorMessage += 'Permission was denied by your system/browser.';
          } else if (pushError.name === 'AbortError') {
            errorMessage += 'The operation was aborted. Please check your internet.';
          } else if (pushError.message?.includes('VAPID')) {
            errorMessage += 'Security key configuration error.';
          } else {
            errorMessage += pushError.message || 'Please try again.';
          }

          alert(errorMessage);
          setIsSubscribing(false);
        }
      } else {
        // Fallback: regular notifications
        if (Notification.permission === 'granted') {
          new Notification('Notifications Enabled! 🎉', {
            body: 'You will now receive updates synced with your account.',
            icon: '/foodCalLogo.jpeg',
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
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
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

  const addNotification = useCallback(
    async (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
      // Insert into DB. Realtime will handle the state update and UI trigger.
      if (!user) return;

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        suggestion: notif.suggestion,
        is_read: false,
      });
    },
    [user, supabase]
  );

  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

      // DB Update
      if (user) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
    },
    [user, supabase]
  );

  const markAllAsRead = useCallback(async () => {
    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    // DB Update
    if (user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    }
  }, [user, supabase]);

  const removeNotification = useCallback(
    async (id: string) => {
      // Optimistic
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      // DB Update
      if (user) {
        await supabase.from('notifications').delete().eq('id', id);
      }
    },
    [user, supabase]
  );

  const sendTestPush = useCallback(async () => {
    if (!user) {
      alert('You must be logged in to test push notifications.');
      return false;
    }

    if (!hasPushSubscription) {
      alert('No push subscription found. Please enable notifications first.');
      return false;
    }

    try {
      const response = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: 'Test Push Notification 🔔',
          body: 'This is a test to verify your mobile device can receive notifications even when the app is closed!',
          data: {
            url: '/',
            test: true,
          },
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        if (result.sent > 0) {
          alert('Test push sent successfully! You should see it on your device shortly.');
          return true;
        } else {
          alert(
            'Push was processed but 0 notifications were sent. This usually means your subscription is invalid or expired.'
          );
          return false;
        }
      } else {
        console.error('Test push failed:', result);
        alert(`Failed to send test push: ${result.error || result.message || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error('Test push error:', error);
      alert('An error occurred while sending the test push.');
      return false;
    }
  }, [user, hasPushSubscription]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
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
        sendTestPush,
      }}
    >
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
