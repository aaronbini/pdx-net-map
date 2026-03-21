# PDX NET Map

An interactive map of Portland's Neighborhood Emergency Teams (NET) and related community resilience resources, rebuilt from the original slow ArcGIS Experience Builder app into a fast, offline-capable React application.

## What it is

The [Portland Bureau of Emergency Management](https://www.portland.gov/pbem/neighborhood-emergency-teams) organizes volunteers into neighborhood-level emergency response teams. The original map at [arcgis.com](https://experience.arcgis.com/experience/b60507fbce994d49b441452afec724b9) has a variety of issues:
* It loads really slowly every time (it has some unnecessarily bulky layers and makes hundreds of network requests)
* It isn't very intuitive (for example, the legend is bulky and confusing to interact with)
* The NET areas aren't shown as polygons on the map consistently across browsers and screen sizes
* It's not mobile friendly
* It doesn't have offline loading (which would be important in an emergency)

This update addresses all of those issues.

The app pulls live data from the PBEM ArcGIS REST API and displays it with:

- **NET Areas** — color-coded by status (active, inactive, outside Portland) with radio channel and city council district filtering
- **Radio Training Sectors** — radio liaison sector boundaries with contact info
- **BEECN Sites** — Basic Earthquake Emergency Communication Nodes
- **Emergency services** — fire stations, hospitals, police facilities
- **Community resources** — grocery stores, schools, community centers, community gardens
- **Hazard layers** — hazardous substance sites, CEI Hub petroleum tanks

## Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [MapLibre GL JS](https://maplibre.org/) for the map renderer
- [Protomaps](https://protomaps.com/) basemap via a local `portland.pmtiles` file (no external tile API needed)
- [@tanstack/react-query](https://tanstack.com/query) for data fetching and caching
- [Workbox](https://developer.chrome.com/docs/workbox/) service worker for offline PWA support
- Data source: [PBEM ArcGIS REST API](https://services.arcgis.com/quVN97tn06YNGj9s/arcgis/rest/services/NETs_Community_Resiliency_WFL1/FeatureServer)

## Offline support

The app installs as a Progressive Web App (PWA). On first load it caches the app shell, the basemap pmtiles file, and the ArcGIS layer data. Subsequent visits work fully offline, with ArcGIS data served from cache when the network is unavailable. A new service worker activates automatically on deploy and reloads the page to deliver the latest version.

## Setup

```bash
cd map
npm install
```

No API token is required — the basemap is served from a local `portland.pmtiles` file bundled with the app.

Then run:

```bash
npm run dev
```
