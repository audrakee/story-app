// Service Worker for PWA and Push Notifications
const CACHE_NAME = 'story-app-v1';
const RUNTIME_CACHE = 'story-app-runtime-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/css/styles.css',
    '/src/scripts/db.js',
    '/src/scripts/api.js',
    '/src/scripts/utils.js',
    '/src/scripts/router.js',
    '/src/scripts/auth.js',
    '/src/scripts/notification.js',
    '/src/scripts/pages/login.js',
    '/src/scripts/pages/register.js',
    '/src/scripts/pages/home.js',
    '/src/scripts/pages/add-story.js',
    '/src/scripts/pages/detail-story.js',
    '/src/scripts/pages/favorites.js',
    '/src/scripts/app.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - Cache first, then network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Don't cache cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // API requests - network first
    if (url.pathname.includes('/v1/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone the response
                    const clone = response.clone();

                    // Cache the response
                    caches.open(RUNTIME_CACHE)
                        .then((cache) => {
                            cache.put(request, clone);
                        });

                    return response;
                })
                .catch(() => {
                    // Return cached version if available
                    return caches.match(request)
                        .then((response) => {
                            return response || createOfflineResponse();
                        });
                })
        );
    } else {
        // Static assets - cache first
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        return response;
                    }

                    return fetch(request)
                        .then((response) => {
                            // Don't cache non-successful responses
                            if (!response || response.status !== 200 || response.type === 'error') {
                                return response;
                            }

                            // Clone the response
                            const clone = response.clone();

                            // Cache the response
                            caches.open(RUNTIME_CACHE)
                                .then((cache) => {
                                    cache.put(request, clone);
                                });

                            return response;
                        })
                        .catch(() => {
                            return createOfflineResponse();
                        });
                })
        );
    }
});

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received');

    let notificationData = {
        title: 'Story App',
        options: {
            body: 'You have a new notification',
            icon: '/src/assets/icon-192x192.png',
            badge: '/src/assets/icon-192x192.png'
        }
    };

    try {
        if (event.data) {
            const data = event.data.json();
            notificationData = {
                title: data.title || 'Story App',
                options: {
                    body: data.options?.body || 'You have a new notification',
                    icon: '/src/assets/icon-192x192.png',
                    badge: '/src/assets/icon-192x192.png',
                    tag: 'story-notification',
                    requireInteraction: false,
                    actions: [
                        {
                            action: 'open',
                            title: 'Open',
                            icon: '/src/assets/icon-192x192.png'
                        },
                        {
                            action: 'close',
                            title: 'Close',
                            icon: '/src/assets/icon-192x192.png'
                        }
                    ]
                }
            };
        }
    } catch (error) {
        console.error('Error parsing push data:', error);
    }

    event.waitUntil(
        self.registration.showNotification(
            notificationData.title,
            notificationData.options
        )
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Open the app when notification is clicked
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // Check if there's already a window/tab open with the target URL
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window/tab with the target URL
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Create offline response
function createOfflineResponse() {
    return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Offline</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: #f8f9fa;
                    margin: 0;
                    padding: 20px;
                }
                .offline-container {
                    text-align: center;
                    background: white;
                    padding: 40px 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    max-width: 400px;
                }
                .offline-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #2d3436;
                    margin-bottom: 10px;
                }
                p {
                    color: #666;
                    line-height: 1.6;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📴</div>
                <h1>You're Offline</h1>
                <p>You are currently offline. Some features may not be available. Please check your internet connection.</p>
                <p>Cached content will be displayed when available.</p>
            </div>
        </body>
        </html>
        `,
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/html'
            })
        }
    );
}
