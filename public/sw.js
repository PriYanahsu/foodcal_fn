// Service Worker for Push Notifications
self.addEventListener('push', function (event) {
    let notificationData = {
        title: 'New Notification',
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                title: data.title || notificationData.title,
                body: data.body || notificationData.body,
                icon: data.icon || notificationData.icon,
                badge: data.badge || notificationData.badge,
            };
        } catch (e) {
            // If data is not JSON, try text
            try {
                const text = event.data.text();
                if (text) {
                    notificationData.body = text;
                }
            } catch (textError) {
                console.error('Failed to parse push data:', textError);
            }
        }
    }

    // Mobile-optimized notification options
    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        vibrate: [100, 50, 100], // Vibration pattern for mobile
        tag: notificationData.title, // Group notifications by title
        requireInteraction: false,
        silent: false,
        renotify: false,
        data: {
            url: self.location.origin + '/',
            timestamp: Date.now(),
        },
    };

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
            .catch(function(error) {
                console.error('Error showing notification:', error);
            })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || self.location.origin + '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        }).then(function (clientList) {
            // Check if there's already a window/tab open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                // Check if client URL matches our origin
                if (client.url && client.url.startsWith(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        }).catch(function(error) {
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
