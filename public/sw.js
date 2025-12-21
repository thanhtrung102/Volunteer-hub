// Service Worker for Web Push Notifications
// This file runs in a separate thread from the main application

const CACHE_NAME = 'volunteerhub-v1';
const urlsToCache = [
  '/',
  '/index.html',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  let notificationData = {
    title: 'VolunteerHub Notification',
    body: 'You have a new update',
    icon: 'https://cdn-icons-png.flaticon.com/128/18891/18891286.png',
    badge: 'https://cdn-icons-png.flaticon.com/128/18891/18891286.png',
    tag: 'volunteer-hub-notification',
    requireInteraction: false,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  // If push has data, parse it
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: 'https://cdn-icons-png.flaticon.com/128/18891/18891286.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: 'https://cdn-icons-png.flaticon.com/128/18891/18891286.png'
        }
      ]
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Handle 'view' action or notification body click
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Background sync event (for offline support)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-registrations') {
    event.waitUntil(syncRegistrations());
  }
});

async function syncRegistrations() {
  // Placeholder for syncing offline registrations
  console.log('[Service Worker] Syncing registrations...');
  return Promise.resolve();
}

// Message event - receive messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      icon: icon || 'https://cdn-icons-png.flaticon.com/128/18891/18891286.png',
      badge: 'https://cdn-icons-png.flaticon.com/128/18891/18891286.png',
      tag: tag || 'volunteer-hub-notification',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now()
      }
    });
  }
});
