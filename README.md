# PDX NET Map

An interactive map of Portland's Neighborhood Emergency Teams (NET) and related community resilience resources, rebuilt from the original slow ArcGIS Experience Builder app into a fast React/Mapbox GL JS application.

## What it is

The [Portland Bureau of Emergency Management](https://www.portland.gov/pbem/neighborhood-emergency-teams) organizes volunteers into neighborhood-level emergency response teams. The original map at [arcgis.com](https://experience.arcgis.com/experience/b60507fbce994d49b441452afec724b9) was slow to load, had no legend, and made it hard to explore the underlying data.

This app pulls the same live data from the PBEM ArcGIS REST API and displays it with:

- **NET Areas** — color-coded by status (active, inactive, outside Portland) with channel filtering
- **BEECN Sites** — Basic Earthquake Emergency Communication Nodes
- **Emergency services** — fire stations, hospitals, police facilities
- **Community resources** — grocery stores, schools, community centers, community gardens
- **Hazard layers** — hazardous substance sites, CEI Hub petroleum tanks, unsafe buildings

## Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [Mapbox GL JS v3](https://docs.mapbox.com/mapbox-gl-js/)
- [@tanstack/react-query](https://tanstack.com/query) for data fetching and caching
- Data source: [PBEM ArcGIS REST API](https://services.arcgis.com/quVN97tn06YNGj9s/arcgis/rest/services/NETs_Community_Resiliency_WFL1/FeatureServer)

## Setup

```bash
cd map
npm install
```

Create `map/.env.local` with your Mapbox public token:

```
VITE_MAPBOX_TOKEN=pk.your_token_here
```

Then run:

```bash
npm run dev
```
