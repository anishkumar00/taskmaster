// ═══════════════════════════════════════════════════════
//  Service Worker — PWA Offline Support
// ═══════════════════════════════════════════════════════

const CACHE_NAME = "taskmaster-v9";

// Files to cache for offline use
const STATIC_FILES = [
    "/",
    "/index.html",
    "/dashboard.html",
    "/css/style.css",
    "/css/auth.css",
    "/css/dashboard.css",
    "/css/settings.css",
    "/css/habits.css",
    "/js/config.js",
    "/js/supabase-client.js",
    "/js/utils.js",
    "/js/state.js",
    "/js/ui.js",
    "/js/tasks.js",
    "/js/timer.js",
    "/js/study.js",
    "/js/stats.js",
    "/js/categories.js",
    "/js/profile.js",
    "/js/settings.js",
    "/js/habits.js",
    "/js/auth.js",
    "/js/app.js",
    "/manifest.json",
];

// Install — cache static files
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_FILES))
            .then(() => self.skipWaiting())
    );
});

// Activate — clear old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch — serve from cache, fallback to network
self.addEventListener("fetch", event => {
    // Skip Supabase API requests (always need live data)
    if (event.request.url.includes("supabase.co")) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                // Cache new static assets
                if (response.ok && event.request.method === "GET") {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                // Offline fallback for HTML pages
                if (event.request.destination === "document") {
                    return caches.match("/index.html");
                }
            });
        })
    );
});