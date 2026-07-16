// Service Worker for PharmaPro Academy PWA
const CACHE_NAME = 'pharmapro-v1';
const urlsToCache = [
  '/',
  '/pharma-landing.html',
  '/dashboard.html',
  '/courses.html',
  '/course-validation.html',
  '/course-capa.html',
  '/course-iso-9001.html',
  '/course-qc-lab.html',
  '/course-ipqc.html',
  '/course-gmp-basics.html',
  '/case-studies.html',
  '/simulation.html',
  '/visual-library.html',
  '/templates.html',
  '/calculators.html',
  '/dictionary.html',
  '/quick-reference.html',
  '/forums.html',
  '/sitemap.html',
  '/css/styles.css',
  '/css/common.css',
  '/js/common.js',
  '/js/video-component.js',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'تحديث جديد في PharmaPro Academy',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'استكشف',
        icon: '/assets/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/assets/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('PharmaPro Academy', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
