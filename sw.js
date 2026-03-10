const CACHE_NAME = 'ns-sec-portfolio-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/assets/favicon.png',
  '/assets/portrait.jpg',
  '/manifest.json',
  '/assets/pgp.txt',
  '/assets/Nikhil_Shakya_CV.pdf',
  'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Event: Cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching fundamental assets');
      // We use addAll but silently fail on external CORS resources if needed
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.warn('[Service Worker] Not all assets could be cached initially:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }
      // 2. Otherwise fetch from network
      return fetch(event.request).catch(() => {
          // 3. Optional fallback logic for purely offline mode (like showing a specific offline page)
          if(event.request.mode === 'navigate') {
              return caches.match('/index.html');
          }
      });
    })
  );
});
