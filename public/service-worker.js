const CACHE_NAME = 'v2';
const UNSUPPORTED_SCHEMES = ['chrome-extension:', 'devtools:', 'data:'];
const BLOCKED_HOSTS = [
  'firestore.googleapis.com',
  'google-analytics.com',
  '/__/firebase',
  '/channel'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Ativo');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar esquemas não suportados e métodos não-GET
  if (UNSUPPORTED_SCHEMES.some(scheme => url.protocol.startsWith(scheme))) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  // Ignorar hosts bloqueados
  if (BLOCKED_HOSTS.some(host => url.hostname.includes(host) || url.pathname.includes(host))) {
    return;
  }

  // Ignorar requisições blob
  if (url.protocol === 'blob:') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        const networkResponse = await fetch(request);

        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic' &&
          !networkResponse.url.includes('chrome-extension')
        ) {
          const responseToCache = networkResponse.clone();
          const cache = await caches.open(CACHE_NAME);
          try {
            await cache.put(request, responseToCache);
          } catch (err) {
            console.warn('[SW] Falha ao armazenar em cache:', err);
          }
        }

        return networkResponse;
      } catch (error) {
        console.error('[SW] Erro na requisição:', error);
        throw error;
      }
    })()
  );
});
