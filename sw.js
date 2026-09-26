// v4: ícones em Lucide (icones.js), avisos com Toast/Dialog (feedback.js) e
// campos com rótulo. Trocar a versão descarta o cache antigo, que serviria o
// CSS/JS anterior (cache-first).
const CACHE_NAME = 'e-financeiro-shell-v4';

const APP_SHELL = [
    'index.html',
    'login.html',
    'cadastro.html',
    'redefinir-senha.html',
    'manifest.json',
    'assets/css/style.css',
    'design-system/ds.css',
    'design-system/tokens/index.css',
    'design-system/tokens/fonts.css',
    'design-system/tokens/colors.css',
    'design-system/tokens/typography.css',
    'design-system/tokens/spacing.css',
    'design-system/tokens/radius.css',
    'design-system/tokens/elevation.css',
    'design-system/tokens/motion.css',
    'design-system/tokens/layout.css',
    'design-system/tokens/components.css',
    'design-system/tokens/base.css',
    'design-system/components/actions/actions.css',
    'design-system/components/forms/forms.css',
    'design-system/components/data-display/data-display.css',
    'design-system/components/charts/charts.css',
    'design-system/components/navigation/navigation.css',
    'design-system/components/feedback/feedback.css',
    'design-system/patterns/patterns.css',
    // Componentes do design system: script.js importa o index.js (que puxa todos)
    'design-system/components/index.js',
    'design-system/components/_internal/dom.js',
    'design-system/components/actions/Button.js',
    'design-system/components/actions/IconButton.js',
    'design-system/components/actions/SegmentedControl.js',
    'design-system/components/forms/Field.js',
    'design-system/components/forms/Input.js',
    'design-system/components/forms/SearchField.js',
    'design-system/components/forms/Select.js',
    'design-system/components/forms/Switch.js',
    'design-system/components/forms/Checkbox.js',
    'design-system/components/data-display/Card.js',
    'design-system/components/data-display/StatCard.js',
    'design-system/components/data-display/Badge.js',
    'design-system/components/data-display/Tag.js',
    'design-system/components/data-display/Avatar.js',
    'design-system/components/data-display/InsightCard.js',
    'design-system/components/data-display/DataTable.js',
    'design-system/components/data-display/ListRow.js',
    'design-system/components/charts/Sparkline.js',
    'design-system/components/charts/AreaChart.js',
    'design-system/components/charts/DonutChart.js',
    'design-system/components/charts/ScoreGauge.js',
    'design-system/components/charts/BarTicks.js',
    'design-system/components/navigation/SidebarNav.js',
    'design-system/components/navigation/TopBar.js',
    'design-system/components/navigation/Tabs.js',
    'design-system/components/navigation/TabBar.js',
    'design-system/components/feedback/ProgressBar.js',
    'design-system/components/feedback/Dialog.js',
    'design-system/components/feedback/Toast.js',
    'design-system/components/feedback/EmptyState.js',
    'design-system/assets/logo-lockup.png',
    'design-system/assets/logo-mark.png',
    'assets/js/theme.js',
    'assets/js/icones.js',
    'assets/js/feedback.js',
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
