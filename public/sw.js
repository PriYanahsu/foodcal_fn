// Service Worker for Push Notifications
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');

    let notificationData = {
        title: 'New Notification',
        body: 'You have a new notification',
        icon: '/foodCalLogo.jpeg',
        badge: '/foodCalLogo.jpeg',
    };

    if (event.data) {
        try {
            const data = event.data.json();
            console.log('[Service Worker] Push JSON data:', data);
            notificationData = {
                title: data.title || notificationData.title,
                body: data.body || data.message || notificationData.body,
                icon: data.icon || notificationData.icon,
                badge: data.badge || notificationData.badge,
                data: data.data || {},
            };
        } catch (e) {
            console.warn('[Service Worker] Push data is not JSON, trying text.');
            try {
                const text = event.data.text();
                console.log('[Service Worker] Push text data:', text);
                if (text) {
                    notificationData.body = text;
                }
            } catch (textError) {
                console.error('[Service Worker] Failed to parse push data:', textError);
            }
        }
    } else {
        console.log('[Service Worker] Push event contains no data.');
    }

    // Mobile-optimized notification options
    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        vibrate: [200, 100, 200], // More pronounced vibration for mobile
        tag: notificationData.title, // Group notifications by title
        requireInteraction: false,
        silent: false,
        renotify: true, // Renotify if the tag is the same
        data: {
            url: notificationData.data?.url || self.location.origin + '/',
            timestamp: Date.now(),
            notificationId: notificationData.data?.notificationId || null,
        },
        actions: [
            {
                action: 'open',
                title: 'View Details',
                icon: '/foodCalLogo.jpeg'
            }
        ]
    };

    console.log('[Service Worker] Showing notification:', notificationData.title);

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
            .then(() => {
                console.log('[Service Worker] Notification shown successfully');
            })
            .catch(function (error) {
                console.error('[Service Worker] Error showing notification:', error);
            })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // Always open to dashboard
    const urlToOpen = event.notification.data?.url || self.location.origin + '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        }).then(function (clientList) {
            // Check if there's already a window/tab open with our origin
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url && client.url.startsWith(self.location.origin)) {
                    // Focus existing window and navigate to dashboard
                    if ('focus' in client) {
                        client.focus();
                        // Navigate to dashboard if not already there
                        if (client.url !== urlToOpen && 'navigate' in client) {
                            client.navigate(urlToOpen);
                        }
                        return;
                    }
                }
            }
            // If no window is open, open a new one to dashboard
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        }).catch(function (error) {
            console.error('Error handling notification click:', error);
            // Fallback: try to open window directly
            if (clients.openWindow) {
                clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', function (event) {
    // Optional: Track notification dismissals
});
