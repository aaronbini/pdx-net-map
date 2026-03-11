# Offline & Mobile Options

The current app uses Mapbox GL JS, which **does not support tile caching** (prohibited by Mapbox ToS). In an emergency where internet is down, the map will not load. Below are three paths to fix this, ordered by implementation effort.

---

## Option 1: Progressive Web App (PWA) — Recommended Starting Point

**What it is:** Add a `manifest.json` and a service worker to the existing Vite/React app. Users open the URL in Safari/Chrome and tap "Add to Home Screen" — no app store required. The app installs like a native app icon.

**Offline capability:**
- App shell (HTML/JS/CSS) cached immediately — works offline after first visit.
- For map tiles: switch from Mapbox GL JS to **MapLibre GL JS** (open-source fork, identical API, no caching ToS restriction) + **PMTiles** (single portable `.pmtiles` file containing all vector tiles for the Portland area). The PMTiles file (~50–200 MB for Portland) is downloaded once and cached by the service worker.

**What a service worker is:** A JavaScript file that runs silently in the background, separate from the web page. The browser installs it once. After that, every network request the page makes (tiles, API calls, images) first goes through the service worker, which can return a cached copy if the network is unavailable. Think of it as a programmable proxy that lives in the browser.

**Steps to implement:**
1. Replace `mapbox-gl` with `maplibre-gl` (API is nearly identical — rename imports, update style URL to a free provider like MapTiler or a self-hosted style)
2. Generate a Portland-area `.pmtiles` file using [Planetiler](https://github.com/onthegomap/planetiler) or download from [OpenFreeMap](https://openfreemap.org/)
3. Add `vite-plugin-pwa` to Vite config — it auto-generates the service worker and `manifest.json`
4. Configure the service worker to cache the `.pmtiles` file on first load
5. Host the `.pmtiles` file on GitHub Pages or any static host alongside the app

**Effort:** 1–3 days
**Distribution:** No app store; users visit the URL and add to home screen
**Cost:** MapTiler free tier (75k tiles/month) or self-host for free; no developer account fees

---

## Option 2: Capacitor — Wrap Existing App in Native Shell

**What it is:** [Capacitor](https://capacitorjs.com/) (by Ionic) wraps the existing React app in a native iOS/Android WebView. The web code is unchanged; Capacitor provides a bridge to native APIs (camera, GPS, push notifications). The result is a real `.ipa`/`.apk` submitted to the App Store / Google Play.

**Offline capability:**
- All app assets are bundled inside the app — no CDN needed after install.
- Same MapLibre + PMTiles approach as Option 1 (bundle the `.pmtiles` file inside the app, or download it on first launch and store in the device filesystem via Capacitor's Filesystem plugin).
- ArcGIS data (NET areas, BEECN sites, etc.) can be pre-fetched and stored in IndexedDB on first launch.

**Steps to implement:**
1. Apply Option 1 changes (MapLibre + PMTiles) first
2. `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
3. `npx cap init` → `npx cap add ios` → `npx cap add android`
4. `npm run build && npx cap sync` — copies `dist/` into the native projects
5. Open in Xcode (iOS) or Android Studio (Android) to sign and submit

**Effort:** 3–5 days (plus App Store review time: ~1–7 days for iOS, ~1–3 days for Android)
**Distribution:** App Store + Google Play
**Cost:** Apple Developer Program: $99/year; Google Play: $25 one-time

---

## Option 3: React Native — Full Native App

**What it is:** A ground-up rewrite of the map UI using React Native and [`@rnmapbox/maps`](https://github.com/rnmapbox/maps), which wraps the Mapbox Maps SDK for iOS/Android natively. Non-map UI (layer controls, popups, filters) is rewritten in React Native components.

**Offline capability:**
- Mapbox Maps SDK for iOS/Android supports **offline tile packs** natively — download a region, it works offline with no ToS issues (offline is explicitly supported in the mobile SDKs).
- GeoJSON data layers (ArcGIS endpoints) can be pre-fetched and stored locally.

**Effort:** 1–2 weeks
**Distribution:** App Store + Google Play
**Cost:** Same Apple/Google developer account fees as Option 2; Mapbox mobile SDK has a free tier (50k MAU)

---

## Comparison

| | PWA | Capacitor | React Native |
|---|---|---|---|
| Code changes | Moderate (MapLibre swap + SW) | Moderate (MapLibre swap + native wrapper) | Full rewrite |
| App Store | No | Yes | Yes |
| Offline maps | Yes (PMTiles) | Yes (PMTiles or bundled) | Yes (native tile packs) |
| Performance | Good | Good | Best |
| Effort | 1–3 days | 3–5 days | 1–2 weeks |
| Annual cost | ~$0 | $99/yr (Apple) | $99/yr (Apple) |

**Recommended path:** Start with Option 1 (PWA + MapLibre + PMTiles). It delivers offline capability without requiring App Store accounts or native toolchains. If the team later needs push notifications, background location, or App Store presence, layer on Capacitor.
