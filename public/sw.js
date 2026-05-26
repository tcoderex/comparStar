const CACHE_NAME = 'star-compare-v2'; // Increment to invalidate previous caches (v1)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Install event: Precache base shell assets and skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event: Delete any outdated caches and claim existing clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Apply Network-First for HTML/routing configurations, and Stale-While-Revalidate/Cache-First for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Navigation requests & index.html (Network-First)
  // This is critical: if online, we ALWAYS grab the latest index.html showing new file hashes.
  // If offline, we serve the cached index.html so the app still functions.
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. static files and assets (Cache-First / Stale-While-Revalidate fallback)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // If it starts with /assets/, Vite uses hashed filenames (e.g. index-ABC123.js),
        // which never change. These are perfectly safe to serve cache-first.
        if (url.pathname.includes('/assets/')) {
          return cachedResponse;
        }

        // For other cached files (images, icons), fetch fresh content in background (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {/* Ignore background sync failures */});

        return cachedResponse;
      }

      // 3. Fallback: Fetch from network and save to cache for next time
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch((err) => {
          // Fail gracefully if offline
          return Promise.reject(err);
        });
    })
  );
});
