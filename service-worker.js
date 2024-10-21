self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('pwa-cache-v1').then(cache => {
        return cache.addAll([
          '/index.html',
          '/app.js',
          '/styles.css',
          '/manifest.json',
          '/images/icon-192.png',
          '/images/icon-512.png',
          '/images/icon-144x144.png', 
          '/images/screenshot1-wide.png',  
          '/images/screenshot2-narrow.png'
        ]);
      })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
});
