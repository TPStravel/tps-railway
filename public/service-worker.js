self.addEventListener("install", (event) => {
  console.log("[SW] Instalado");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Ativo");
  return self.clients.claim();
});

// Interceptar apenas arquivos estáticos (não requisitar dados como Firestore)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Evitar interceptar chamadas para Firestore ou canais
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.pathname.includes("channel") ||
    url.pathname.includes("/__/firebase")
  ) {
    return; // deixar seguir normalmente
  }

  // Apenas responder com cache para arquivos estáticos
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((res) => {
          return caches.open("v1").then((cache) => {
            cache.put(event.request, res.clone());
            return res;
          });
        })
      );
    })
  );
});
