self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('pwa-cache-v1').then(cache => {
        return cache.addAll([
          '/blue/index.html',
          '/blue/app.js',
          '/blue/styles.css',
          '/blue/manifest.json',
          '/blue/images/icon-192.png',
          '/blue/images/icon-512.png',
          '/blue/images/icon-144x144.png', 
          '/blue/images/screenshot1-wide.png',  
          '/blue/images/screenshot2-narrow.png'
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
