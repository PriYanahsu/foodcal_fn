const CACHE_NAME = 'foodcal-v2';
const ASSETS_TO_CACHE = ['/', '/manifest.json', '/foodCalLogo.jpeg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation requests: Network First, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) return response;
          // Ideally fallback to an offline page here, but for now just returning nothing or home if cached
          return caches.match('/');
        });
      })
    );
    return;
  }

  // Static assets (images, css, js): Stale-While-Revalidate
  if (
    event.request.destination === 'image' ||
    event.request.destination === 'script' ||
    event.request.destination === 'style'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

// Service Worker for Push Notifications
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');

  let notificationData = {
    title: 'FoodCal Update 🔔',
    body: 'Check your progress in the app!',
    icon: '/foodCalLogo.jpeg',
    badge: '/foodCalLogo.jpeg',
    data: { url: self.location.origin + '/' },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[Service Worker] Push JSON data parsing successful:', data);
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || notificationData.data,
      };
    } catch (e) {
      console.warn('[Service Worker] Push data is not JSON, falling back to text parsing.');
      try {
        const text = event.data.text();
        console.log('[Service Worker] Push text data received:', text);
        if (text) {
          notificationData.body = text;
        }
      } catch (textError) {
        console.error('[Service Worker] Failed to parse push data entirely:', textError);
      }
    }
  } else {
    console.warn('[Service Worker] Push event contains no data. Using default message.');
  }

  // Prefer absolute URLs for icons (push clients often reject relative paths)
  const origin = self.location.origin;
  const resolveUrl = (value) => {
    if (!value) return origin + '/foodCalLogo.jpeg';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return origin + (value.startsWith('/') ? value : '/' + value);
  };

  // Stable tag = dedupe with Realtime local OS banner (same notificationId)
  const notificationId = notificationData.data?.notificationId;
  const tag = notificationId
    ? 'foodcal-' + notificationId
    : notificationData.title || 'foodcal-push';

  // Mobile-optimized notification options
  const options = {
    body: notificationData.body,
    icon: resolveUrl(notificationData.icon),
    badge: resolveUrl(notificationData.badge),
    vibrate: [200, 100, 200, 100, 200],
    tag: tag,
    requireInteraction: false,
    silent: false,
    renotify: true,
    data: {
      url: notificationData.data?.url || origin + '/',
      notificationId: notificationId || null,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'View App',
        icon: origin + '/foodCalLogo.jpeg',
      },
    ],
  };

  console.log('[Service Worker] Displaying notification:', notificationData.title, options);

  event.waitUntil(
    self.registration
      .showNotification(notificationData.title, options)
      .then(() => {
        console.log('[Service Worker] Notification was shown successfully');
      })
      .catch(function (error) {
        console.error('[Service Worker] Error occurred while showing notification:', error);
      })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // Always open to dashboard
  const urlToOpen = event.notification.data?.url || self.location.origin + '/';

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function (clientList) {
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
      })
      .catch(function (error) {
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
