const CACHE_NAME = 'sf-static-v1';
const MEDIA_CACHE = 'sf-media-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Intercept fetches to cache static & media
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Media caching policy: preview MP3s & audio files
  if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav') || url.pathname.endsWith('.m3u8')) {
    e.respondWith(
      caches.open(MEDIA_CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
            const resp = await fetch(e.request);
            // Cache only if successful
            if (resp && resp.status === 200) {
                cache.put(e.request, resp.clone());
            }
            return resp;
        } catch (err) {
            return cached; // Return cached if offline
        }
      })
    );
    return;
  }
  
  // Default network first
  e.respondWith(fetch(e.request));
});