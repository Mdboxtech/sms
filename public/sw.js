// Service Worker for SMS PWA
const CACHE_NAME = 'sms-pwa-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip API requests (they should always be fresh)
    if (event.request.url.includes('/api/') ||
        event.request.url.includes('/login') ||
        event.request.url.includes('/logout') ||
        event.request.url.includes('/admin') ||
        event.request.url.includes('/teacher') ||
        event.request.url.includes('/student')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response before caching
                const responseClone = response.clone();

                // Cache successful responses for static assets
                if (response.status === 200 &&
                    (event.request.url.includes('/build/') ||
                        event.request.url.includes('/images/') ||
                        event.request.url.includes('/fonts/'))) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }

                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // Return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/offline.html');
                    }

                    return new Response('Offline', { status: 503 });
                });
            })
    );
});

// Handle background sync (future feature)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync event:', event.tag);
});

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/storage/logos/default-logo.png',
        badge: '/images/badge.png'
    };

    event.waitUntil(
        self.registration.showNotification('SMS Notification', options)
    );
});
