// Service worker for GPS Antenna Pointer PWA.
// Strategy: cache-first for the app shell, stale-while-revalidate for OSM tiles.

const VERSION = "v1";
const SHELL_CACHE = `gps-shell-${VERSION}`;
const TILE_CACHE = `gps-tiles-${VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/static/manifest.json",
  "/static/icon.svg",
  "/static/icon-maskable.svg",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/leaflet-rotate@0.2.8/dist/leaflet-rotate.js",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache =>
      Promise.all(
        SHELL_ASSETS.map(url =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => {})
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== SHELL_CACHE && k !== TILE_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // OSM tiles → stale-while-revalidate
  if (/\.tile\.openstreetmap\.org$/.test(url.hostname)) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(req).then(cached => {
          const network = fetch(req).then(resp => {
            if (resp && resp.status === 200) cache.put(req, resp.clone());
            return resp;
          }).catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  // App shell / same-origin / CDN assets → cache-first with network fallback
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (resp && resp.status === 200 &&
            (url.origin === self.location.origin || SHELL_ASSETS.includes(req.url))) {
          const clone = resp.clone();
          caches.open(SHELL_CACHE).then(cache => cache.put(req, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
