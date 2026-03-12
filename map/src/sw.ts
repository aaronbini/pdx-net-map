/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { RangeRequestsPlugin } from 'workbox-range-requests'

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

// PMTiles range requests (status 206 = Partial Content)
registerRoute(
  ({ url }) => url.pathname.endsWith('.pmtiles'),
  new CacheFirst({
    cacheName: 'pmtiles',
    plugins: [
      new RangeRequestsPlugin(),
      new CacheableResponsePlugin({ statuses: [0, 200, 206] }),
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 90 }),
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

self.addEventListener('message', (event) => {
  if ((event.data as { type?: string } | null)?.type === 'SKIP_WAITING') void self.skipWaiting()
})
