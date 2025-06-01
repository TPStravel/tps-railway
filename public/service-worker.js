const CACHE_NAME = 'tps-v3';

self.addEventListener('install', (event) => {
  console.log('[SW] Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass para esquemas não suportados (extensões e blobs)
  if (
    request.url.startsWith("chrome-extension://") ||
    request.url.startsWith("moz-extension://") ||
    request.url.startsWith("edge-extension://") ||
    url.protocol === 'blob:' ||
    url.protocol === 'data:'
  ) {
    return;
  }

  // 2. Ignorar métodos não GET
  if (request.method !== 'GET') {
    return;
  }

  // 3. Bypass para chamadas do Firebase/Firestore ou scripts especiais
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebase.googleapis.com") ||
    url.hostname.includes("gstatic.com") ||
    url.pathname.includes("/__/firebase") ||
    url.pathname.includes("/channel") ||
    url.pathname.endsWith(".json")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((fetchResponse) => {
        // 4. Verificações para garantir que é seguro armazenar em cache
        if (
          fetchResponse.type === 'opaque' ||
          request.mode === 'no-cors' ||
          !fetchResponse.ok ||
          fetchResponse.url.startsWith("chrome-extension://")
        ) {
          return fetchResponse;
        }

        const responseClone = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone).catch((err) => {
            console.warn("[SW] Erro ao cachear:", err);
          });
        });

        return fetchResponse;
      }).catch((error) => {
        console.error("[SW] Erro ao buscar:", error);
        throw error;
      });
    })
  );
});
