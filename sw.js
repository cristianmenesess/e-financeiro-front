const CACHE_NAME = 'e-financeiro-shell-v1';

const APP_SHELL = [
    'index.html',
    'login.html',
    'cadastro.html',
    'redefinir-senha.html',
    'manifest.json',
    'assets/css/style.css',
    'assets/js/theme.js',
    'assets/js/script.js',
    'assets/js/login.js',
    'assets/js/cadastro.js',
    'assets/js/redefinir-senha.js',
    'assets/js/pwa.js',
    'assets/imagens/icons/icon-192.png',
    'assets/imagens/icons/icon-512.png',
    'assets/imagens/icons/apple-touch-icon.png',
    'assets/imagens/icons/favicon-32.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Só cuida de GET no próprio domínio; chamadas à API (outro domínio) seguem direto pra rede.
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match('index.html')))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                return response;
            });
        })
    );
});
