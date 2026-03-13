/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Basemap glyphs + tiles (MapTiler CDN)
registerRoute(
  ({ url }) => url.hostname === 'api.maptiler.com',
  new CacheFirst({
    cacheName: 'maptiler',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
)

// Protomaps sprites (basemap icons)
registerRoute(
  ({ url }) => url.hostname === 'protomaps.github.io',
  new CacheFirst({
    cacheName: 'protomaps-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 90 }),
    ],
  })
)

// ArcGIS GeoJSON data (network-first, fall back to cache when offline)
registerRoute(
  ({ url }) => url.hostname.includes('arcgis.com'),
  new NetworkFirst({
    cacheName: 'arcgis-data',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
)

// Skip the "waiting" phase and activate immediately when a new SW is installed.
// Without this, a new SW would sit idle until every open tab is closed — meaning
// users would never see updates unless they manually closed and reopened the app.
self.addEventListener('install', () => {
  void self.skipWaiting()
})

// After activating, claim all open tabs immediately so they're controlled by the
// new SW right away. This triggers a 'controllerchange' event in App.tsx, which
// reloads the page so users get the new version of the app.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
