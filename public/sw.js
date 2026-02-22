// ============================================
// Service Worker - Tu Súper Tienda
// Estrategia: Network-First con auto-update
// ============================================

const CACHE_NAME = 'tu-super-tienda-v1';

// Archivos estáticos mínimos a cachear
const STATIC_ASSETS = [
    '/favicon.svg',
    '/manifest.json',
];

// Install: precache los assets estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    // Activar inmediatamente sin esperar a que se cierre la pestaña
    self.skipWaiting();
});

// Activate: limpiar cachés viejas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    // Tomar control de todas las pestañas abiertas
    self.clients.claim();
});

// Fetch: Network-first, fallback a caché
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Solo cachear GET requests
    if (request.method !== 'GET') return;

    // No cachear requests de API ni de auth
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clonar la respuesta para guardarla en caché
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Si no hay red, intentar servir desde caché
                return caches.match(request);
            })
    );
});

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
