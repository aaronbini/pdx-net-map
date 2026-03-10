# Maki Icon Implementation Guide

How to replace the current circle markers with Maki icons that can be tinted with per-layer colors.

## Why the previous attempt failed

The first attempt used `icon-image: 'fire-station'` etc., expecting those names to be in the Mapbox `light-v11` style sprite. Two problems:
1. Some icon names (`star`, `danger`) don't exist in the sprite under those names.
2. In mapbox-gl v3, the built-in sprite icons are not SDF format, so `icon-color` tinting doesn't work — everything renders gray.

## The correct approach

Load custom SDF images using `map.addImage(name, imageData, { sdf: true })`. With `sdf: true`, Mapbox tints non-transparent pixels with `icon-color`. This is fully supported in v3 and doesn't depend on the style sprite at all.

---

## Manual step

```bash
cd /Users/aaronbini/repos/pdxnet/map
npm install @mapbox/maki
```

No other config changes needed. Vite supports `?raw` SVG imports natively.

---

## New file: `src/utils/mapIcons.ts`

```ts
import type mapboxgl from 'mapbox-gl'

const SIZE = 24

function svgToImageData(svgString: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image(SIZE, SIZE)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, SIZE, SIZE)
      URL.revokeObjectURL(url)
      resolve(ctx.getImageData(0, 0, SIZE, SIZE))
    }
    img.onerror = reject
    img.src = url
  })
}

export async function loadMapIcons(
  map: mapboxgl.Map,
  icons: Record<string, string>
): Promise<void> {
  await Promise.all(
    Object.entries(icons).map(async ([name, svg]) => {
      if (map.hasImage(name)) return
      const imageData = await svgToImageData(svg)
      map.addImage(name, imageData, { sdf: true })
    })
  )
}
```

---

## Changes to `Map.tsx`

### 1. Add imports at top of file

```ts
import { loadMapIcons } from '../utils/mapIcons'
import beecnSvg      from '@mapbox/maki/icons/star.svg?raw'
import fireSvg       from '@mapbox/maki/icons/fire-station.svg?raw'
import hospitalSvg   from '@mapbox/maki/icons/hospital.svg?raw'
import grocerySvg    from '@mapbox/maki/icons/grocery.svg?raw'
import schoolSvg     from '@mapbox/maki/icons/school.svg?raw'
import communitySvg  from '@mapbox/maki/icons/town-hall.svg?raw'
import policeSvg     from '@mapbox/maki/icons/police.svg?raw'
import dangerSvg     from '@mapbox/maki/icons/danger.svg?raw'

const MAKI_ICONS: Record<string, string> = {
  'pdx-beecn':     beecnSvg,
  'pdx-fire':      fireSvg,
  'pdx-hospital':  hospitalSvg,
  'pdx-grocery':   grocerySvg,
  'pdx-school':    schoolSvg,
  'pdx-community': communitySvg,
  'pdx-police':    policeSvg,
  'pdx-danger':    dangerSvg,
}
```

### 2. Make `map.on('load', ...)` async — load icons before `setMapLoaded(true)`

```ts
// Replace:
map.on('load', () => setMapLoaded(true))

// With:
map.on('load', async () => {
  await loadMapIcons(map, MAKI_ICONS)
  setMapLoaded(true)
})
```

### 3. Update `pointLayers` array — add `icon` field

```ts
const pointLayers: Array<{ sourceId: string; layerId: string; layerKey: LayerId; icon: string }> = [
  { sourceId: 'beecn',             layerId: 'beecn-points',     layerKey: 'beecn',            icon: 'pdx-beecn' },
  { sourceId: 'fire-stations',     layerId: 'fire-points',      layerKey: 'fireStations',     icon: 'pdx-fire' },
  { sourceId: 'hospitals',         layerId: 'hospital-points',  layerKey: 'hospitals',        icon: 'pdx-hospital' },
  { sourceId: 'grocery-stores',    layerId: 'grocery-points',   layerKey: 'groceryStores',    icon: 'pdx-grocery' },
  { sourceId: 'schools',           layerId: 'school-points',    layerKey: 'schools',          icon: 'pdx-school' },
  { sourceId: 'community-centers', layerId: 'community-points', layerKey: 'communityCenters', icon: 'pdx-community' },
  { sourceId: 'police',            layerId: 'police-points',    layerKey: 'police',           icon: 'pdx-police' },
  { sourceId: 'hazardous-sites',   layerId: 'hazardous-points', layerKey: 'hazardousSites',   icon: 'pdx-danger' },
]
```

### 4. Switch layer creation from `circle` to `symbol`

```ts
for (const { sourceId, layerId, layerKey, icon } of pointLayers) {
  if (map.getSource(sourceId) && !map.getLayer(layerId)) {
    const color = getLayerConfig(layerKey).color
    map.addLayer({
      id: layerId,
      type: 'symbol',
      source: sourceId,
      layout: {
        visibility: visibleLayersRef.current.has(layerKey) ? 'visible' : 'none',
        'icon-image': icon,
        'icon-size': 1.0,
        'icon-allow-overlap': false,
      },
      paint: {
        'icon-color': color,
        'icon-halo-color': '#fff',
        'icon-halo-width': 1.5,
      },
    })
  }
}
```

### 5. Update click handler coordinate extraction

Symbol layer features return Point geometry. Replace the click coord extraction for point features:

```ts
// Was (circle):
const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number]

// Stays the same — symbol layers also return Point geometry. No change needed.
```

---

## Icon name reference

| Layer | `@mapbox/maki` file |
|---|---|
| BEECN | `icons/star.svg` |
| Fire Stations | `icons/fire-station.svg` |
| Hospitals | `icons/hospital.svg` |
| Grocery Stores | `icons/grocery.svg` |
| Schools | `icons/school.svg` |
| Community Centers | `icons/town-hall.svg` |
| Police | `icons/police.svg` |
| Hazardous Sites | `icons/danger.svg` |

Full icon list: https://labs.mapbox.com/maki-icons/
