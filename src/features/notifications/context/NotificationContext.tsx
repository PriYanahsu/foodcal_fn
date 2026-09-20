'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification, NotificationContextType } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getVapidPublicKey } from '@/lib/vapid-key';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Turning push off unsubscribes, but the browser permission stays granted — without
 * this flag the auto-subscribe below would silently switch it back on next load.
 */
const PUSH_OFF_KEY = 'foodcal-push-off';

function isPushTurnedOff() {
  try {
    return localStorage.getItem(PUSH_OFF_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberPushOff(off: boolean) {
  try {
    if (off) localStorage.setItem(PUSH_OFF_KEY, '1');
    else localStorage.removeItem(PUSH_OFF_KEY);
  } catch {
    // Private mode / blocked storage — the toggle still works for this session.
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [hasPushSubscription, setHasPushSubscription] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const hasPushSubscriptionRef = React.useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    hasPushSubscriptionRef.current = hasPushSubscription;
  }, [hasPushSubscription]);

  // 1. Load from Supabase DB on mount
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setNotifications([]);
  }, [user]);
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !user) return;

    let cancelled = false;

    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (cancelled) return;

        if (subscription) {
          setHasPushSubscription(true);
          // Re-sync to DB in case previous save failed
          try {
            await fetch('/api/push-subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                  auth: arrayBufferToBase64(subscription.getKey('auth')!),
                },
              }),
            });
          } catch (e) {
            console.warn('Failed to re-sync push subscription:', e);
          }
          return;
        }

        setHasPushSubscription(false);

        // Permission already granted but no PushManager subscription → create one,
        // unless the user turned reminders off here.
        if (Notification.permission === 'granted' && !isPushTurnedOff()) {
          console.log('Permission granted but no push subscription — auto-subscribing...');
          await ensurePushSubscription(registration);
        }
      } catch (e) {
        console.warn('Push subscription check failed:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function ensurePushSubscription(registration: ServiceWorkerRegistration) {
    const vapidPublicKey = getVapidPublicKey();
    if (!vapidPublicKey) return false;

    try {
      setIsSubscribing(true);
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      let pushSubscription = await registration.pushManager.getSubscription();
      if (!pushSubscription) {
        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        });
      }

      const response = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: pushSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(pushSubscription.getKey('auth')!),
          },
        }),
      });

      if (response.ok) {
        setHasPushSubscription(true);
        return true;
      }
      console.error('Auto-subscribe save failed:', await response.json().catch(() => ({})));
      return false;
    } catch (e) {
      console.error('Auto-subscribe failed:', e);
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }

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

      rememberPushOff(false);

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
            // Confirm with a real device/OS popup (not the in-app toast)
            if (Notification.permission === 'granted') {
              const origin = window.location.origin;
              const opts: NotificationOptions = {
                body: 'You will now receive notifications even when the app is closed!',
                icon: `${origin}/foodCalLogo.jpeg`,
                badge: `${origin}/foodCalLogo.jpeg`,
                tag: 'push-enabled',
              };
              try {
                await registration.showNotification('Push Notifications Enabled! 🎉', opts);
              } catch {
                new Notification('Push Notifications Enabled! 🎉', opts);
              }
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

  const addNotification = useCallback(
    async (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
      if (!user) return;
      setNotifications((prev) => [
        {
          ...notif,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          isRead: false,
        },
        ...prev,
      ]);
    },
    [user]
  );

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const disablePush = useCallback(async () => {
    try {
      setIsSubscribing(true);
      rememberPushOff(true);

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await fetch('/api/push-subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          }).catch(() => undefined);
          await subscription.unsubscribe();
        }
      }

      setHasPushSubscription(false);
    } catch (e) {
      console.error('Failed to turn off push notifications:', e);
    } finally {
      setIsSubscribing(false);
    }
  }, []);

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
        disablePush,
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
