import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { layers as protomapsLayers, LIGHT } from '@protomaps/basemaps'
import type { LayerId } from '../types'

// Register pmtiles:// protocol once at module load
const _pmtilesProtocol = new Protocol()
maplibregl.addProtocol('pmtiles', _pmtilesProtocol.tile.bind(_pmtilesProtocol))
import { getLayerConfig } from '../constants/layers'
import { loadMapIcons } from '../utils/mapIcons'
import { LAYER_ICONS } from '../constants/icons'
import {
  useNetAreas, useBeecn, useFireStations, useHospitals,
  useGroceryStores, useSchools, useCommunityCenters,
  usePolice, useNeighborhoods, useHazardousSites,
  useCeiTanks, /*useUnsafeBuildings,*/ useCommunityGardens, useRadioSectors,
} from '../hooks/useArcGIS'


interface Props {
  visibleLayers: Set<LayerId>
  channelFilter: number | null
  districtFilter: number | null
}

// ---------------------------------------------------------------------------
// Popup HTML builders
// ---------------------------------------------------------------------------

function netPopup(p: Record<string, unknown>) {
  const isPortland = p.Jurisdiction === 'Portland'
  const title = p.NET_Team_Name ?? p.NAME ?? 'Unknown Area'
  const statusLabel = p.Inactive
    ? `<span style="color:#94a3b8">Inactive</span>`
    : isPortland
      ? `<span style="color:#22c55e">Active</span>`
      : `<span style="color:#a78bfa">Outside Portland${p.Jurisdiction ? ` · ${p.Jurisdiction}` : ''}</span>`
  const email = p.PBEM_Liaison_Contact
    ? `<a href="mailto:${p.PBEM_Liaison_Contact}" style="color:#3b82f6">${p.PBEM_Liaison_Contact}</a>`
    : null
  return `
    <strong style="font-size:13px">${title}</strong><br/>
    <span style="font-size:11px;color:#64748b">${statusLabel}</span>
    ${p.Neighborhoods_Included ? `<div style="margin-top:4px;font-size:11px;color:#475569">${p.Neighborhoods_Included}</div>` : ''}
    <table style="margin-top:6px;font-size:12px;border-collapse:collapse">
      ${p.Council_District ? `<tr><td style="color:#64748b;padding-right:8px;padding-bottom:2px">District</td><td>${p.Council_District}</td></tr>` : ''}
      ${p.COALIT ? `<tr><td style="color:#64748b;padding-right:8px;padding-bottom:2px">Coalition</td><td>${p.COALIT}</td></tr>` : ''}
      ${p.Channel_Primary ? `<tr><td style="color:#64748b;padding-right:8px;padding-bottom:2px">Primary Ch.</td><td>${p.Channel_Primary}</td></tr>` : ''}
      ${p.Channel_Secondary ? `<tr><td style="color:#64748b;padding-right:8px;padding-bottom:2px">Secondary Ch.</td><td>${p.Channel_Secondary}</td></tr>` : ''}
      ${p.PBEM_Liaison ? `<tr><td style="color:#64748b;padding-right:8px;padding-bottom:2px">Liaison</td><td>${p.PBEM_Liaison}</td></tr>` : ''}
      ${email ? `<tr><td style="color:#64748b;padding-right:8px;padding-bottom:2px">Email</td><td>${email}</td></tr>` : ''}
      ${p.BEECN_Resources ? `<tr><td style="color:#64748b;padding-right:8px;padding-bottom:2px;vertical-align:top">BEECN</td><td style="font-size:11px">${p.BEECN_Resources}</td></tr>` : ''}
    </table>
    ${p.Team_URL ? `<div style="margin-top:6px"><a href="${p.Team_URL}" target="_blank" rel="noreferrer" style="color:#3b82f6;font-size:12px">Team page →</a></div>` : ''}
  `
}

function genericPopup(title: string, fields: [string, unknown][]) {
  const rows = fields
    .filter(([, v]) => v != null && v !== '')
    .map(([label, val]) => `<tr><td style="color:#64748b;padding-right:8px">${label}</td><td>${val}</td></tr>`)
    .join('')
  return `<strong>${title}</strong><br/><table style="margin-top:4px;font-size:12px">${rows}</table>`
}

function buildPopup(layerId: string, props: Record<string, unknown>): string {
  switch (layerId) {
    case 'cei-tanks-fill':
      return genericPopup(String(props.Facility ?? 'CEI Hub Tank'), [
        ['Tank ID', props.TANK_ID],
        ['Substance', props.Substance],
        ['Max Capacity', props.Max_Capacity ? `${Number(props.Max_Capacity).toLocaleString()} gal` : null],
        ['Container Type', props.Container_Type],
        ['Year Built', props.Year],
        ['Owner', props.Owner],
      ])
    case 'unsafe-fill':
      return genericPopup(String(props.BLDG_NAME ?? 'Unsafe Building'), [
        ['Use', props.BLDG_USE],
        ['Condition', props.STRUC_COND],
        ['Year Built', props.YEAR_BUILT],
        ['Stories', props.NUM_STORY],
        ['Size', props.BLDG_SQFT ? `${Number(props.BLDG_SQFT).toLocaleString()} sq ft` : null],
      ])
    case 'gardens-fill':
      return genericPopup('Community Garden', [
        ['Status', props.Status],
        ['Acres', props.Acres],
        ['Plots', props.Plotspergarden],
        ['Waitlist', props.Waitlist != null ? String(props.Waitlist) : null],
      ])
    case 'net-areas-fill':
      return netPopup(props)
    case 'beecn-points':
      return genericPopup(String(props.SITE_NAME ?? 'BEECN Site'), [
        ['Location', props.LOCATION],
        ['Owner', props.SITE_OWNER],
        ['Map ID', props.MAP_ID],
      ])
    case 'fire-points':
      return genericPopup(`Station ${props.STATION}`, [
        ['Address', props.ADDRESS],
        ['District', props.DISTRICT],
      ])
    case 'hospital-points':
      return genericPopup(String(props.NAME ?? 'Hospital'), [
        ['Address', props.ADDRESS],
        ['City', props.CITY],
        ['Zip', props.ZIPCODE],
      ])
    case 'grocery-points':
      return genericPopup(String(props.NAME ?? 'Grocery Store'), [
        ['Address', props.ADDRESS],
        ['Type', props.TYPE],
      ])
    case 'school-points':
      return genericPopup(String(props.NAME ?? 'School'), [
        ['Address', props.ADDRESS],
        ['City', props.CITY],
        ['District', props.DISTRICT],
        ['Level', props.LEVEL_NAME],
        ['Type', props.TYPE],
        ['Phone', props.PHONE],
      ])
    case 'community-points':
      return genericPopup(String(props.NAME ?? 'Community Center'), [
        ['Address', props.ADDRESS],
        ['Phone', props.PHONE],
        ['Email', props.EMAIL],
        ['Website', props.WEB_URL ? `<a href="${props.WEB_URL}" target="_blank" rel="noreferrer">${props.WEB_URL}</a>` : null],
        ['Owner', props.OWNER],
      ])
    case 'police-points':
      return genericPopup(String(props.name ?? 'Police Facility'), [
        ['Address', props.address],
      ])
    case 'hazardous-points':
      return genericPopup(String(props.Facility_Name ?? 'Hazardous Site'), [
        ['Address', props.Site_Address],
        ['City', props.City],
        ['Chemical', props.Chemical_Name],
        ['Hazard Class', props.First_Hazard_Class_Description],
        ['Business Type', props.Business_Type],
      ])
    case 'radio-sectors-fill':
      return genericPopup(`Radio Sector: ${props.Radio_Training_Sector ?? ''}`, [
        ['Liaison', props.Radio_Training_Lisison],
        ['Call Sign', props.Radio_Training_Liaison_CallSign],
        ['Email', props.Radio_Training_Liaison_Email
          ? `<a href="mailto:${props.Radio_Training_Liaison_Email}" style="color:#3b82f6">${props.Radio_Training_Liaison_Email}</a>`
          : null],
      ])
    default:
      return String(props.NAME ?? props.name ?? '')
  }
}

// ---------------------------------------------------------------------------
// Layer definitions
// ---------------------------------------------------------------------------

type SourceSpec = { id: string; data: GeoJSON.FeatureCollection }

// ---------------------------------------------------------------------------
// Map component
// ---------------------------------------------------------------------------

export function Map({ visibleLayers, channelFilter, districtFilter }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const visibleLayersRef = useRef(visibleLayers)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Keep ref current so the main effect can read visibility without adding it as a dep
  useEffect(() => { visibleLayersRef.current = visibleLayers }, [visibleLayers])

  const netAreas         = useNetAreas()
  const beecn            = useBeecn()
  const fireStations     = useFireStations()
  const hospitals        = useHospitals()
  const groceryStores    = useGroceryStores()
  const schools          = useSchools()
  const communityCenters = useCommunityCenters()
  const police           = usePolice()
  const neighborhoods    = useNeighborhoods()
  const hazardousSites   = useHazardousSites()
  const ceiTanks         = useCeiTanks()
  // const unsafeBuildings  = useUnsafeBuildings()
  const communityGardens = useCommunityGardens()
  const radioSectors     = useRadioSectors()

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const tilesUrl = `${location.origin}${import.meta.env.BASE_URL}portland.pmtiles`
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
        sources: {
          protomaps: {
            type: 'vector',
            url: `pmtiles://${tilesUrl}`,
            attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layers: protomapsLayers('protomaps', LIGHT, { lang: 'en' }) as any,
      },
      center: [-122.65, 45.52],
      zoom: 11,
      minZoom: 7,
    })

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right')
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left')

    map.on('load', async () => {
      const iconDefs = Object.fromEntries(
        (Object.entries(LAYER_ICONS) as [LayerId, string][]).map(([layerKey, svg]) => [
          `pdx-${layerKey}`,
          { svg, color: getLayerConfig(layerKey).color },
        ])
      )
      await loadMapIcons(map, iconDefs)
      setMapLoaded(true)
    })
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      setMapLoaded(false)
    }
  }, [])

  // Add/update sources and layers as data arrives
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const sources: SourceSpec[] = [
      { id: 'net-areas',          data: netAreas.data! },
      { id: 'beecn',              data: beecn.data! },
      { id: 'fire-stations',      data: fireStations.data! },
      { id: 'hospitals',          data: hospitals.data! },
      { id: 'grocery-stores',     data: groceryStores.data! },
      { id: 'schools',            data: schools.data! },
      { id: 'community-centers',  data: communityCenters.data! },
      { id: 'police',             data: police.data! },
      { id: 'neighborhoods',      data: neighborhoods.data! },
      { id: 'hazardous-sites',    data: hazardousSites.data! },
      { id: 'cei-tanks',          data: ceiTanks.data! },
      // { id: 'unsafe-buildings',   data: unsafeBuildings.data! },
      { id: 'community-gardens',  data: communityGardens.data! },
      { id: 'radio-sectors',      data: radioSectors.data! },
    ].filter(s => s.data != null)

    for (const { id, data } of sources) {
      const existing = map.getSource(id) as maplibregl.GeoJSONSource | undefined
      if (existing) {
        existing.setData(data)
      } else {
        map.addSource(id, { type: 'geojson', data })
      }
    }

    // Polygon layers (add before points so they render underneath)
    if (netAreas.data && !map.getLayer('net-areas-fill')) {
      // NET area color: blue (active Portland), gray (inactive Portland), purple (outside Portland)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const netColor: any = [
        'case',
        ['!=', ['get', 'Jurisdiction'], 'Portland'], '#a78bfa',
        ['==', ['get', 'Inactive'], 'Inactive'],      '#64748b',
        '#3b82f6',
      ]

      const netVis = visibleLayersRef.current.has('netAreas') ? 'visible' : 'none'
      map.addLayer({
        id: 'net-areas-fill',
        type: 'fill',
        source: 'net-areas',
        layout: { visibility: netVis },
        paint: {
          'fill-color': netColor,
          'fill-opacity': [
            'case',
            ['!=', ['get', 'Jurisdiction'], 'Portland'], 0.15,
            ['==', ['get', 'Inactive'], 'Inactive'], 0.35,
            0.25,
          ],
        },
      })
      map.addLayer({
        id: 'net-areas-line',
        type: 'line',
        source: 'net-areas',
        layout: { visibility: netVis },
        paint: {
          'line-color': netColor,
          'line-width': [
            'case',
            ['!=', ['get', 'Jurisdiction'], 'Portland'], 0.5,
            2,
          ],
          'line-opacity': [
            'case',
            ['!=', ['get', 'Jurisdiction'], 'Portland'], 0.3,
            1,
          ],
        },
      })
      map.addLayer({
        id: 'net-areas-label',
        type: 'symbol',
        source: 'net-areas',
        layout: {
          visibility: netVis,
          'text-field': ['get', 'NET_Team_Name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#1e3a5f',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5,
        },
        minzoom: 11,
      })
    }

    if (neighborhoods.data && !map.getLayer('neighborhoods-line')) {
      const nVis = visibleLayersRef.current.has('neighborhoods') ? 'visible' : 'none'
      map.addLayer({
        id: 'neighborhoods-line',
        type: 'line',
        source: 'neighborhoods',
        layout: { visibility: nVis },
        paint: {
          'line-color': '#94a3b8',
          'line-width': 0.75,
          'line-dasharray': [2, 2],
        },
      })
      map.addLayer({
        id: 'neighborhoods-label',
        type: 'symbol',
        source: 'neighborhoods',
        layout: {
          visibility: nVis,
          'text-field': ['get', 'MAPLABEL'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 10,
        },
        paint: {
          'text-color': '#64748b',
          'text-halo-color': '#fff',
          'text-halo-width': 1,
        },
        minzoom: 13,
      })
    }

    // Polygon layers — CEI tanks, community gardens, unsafe buildings
    if (ceiTanks.data && !map.getLayer('cei-tanks-fill')) {
      const vis = visibleLayersRef.current.has('ceiTanks') ? 'visible' : 'none'
      map.addLayer({ id: 'cei-tanks-fill', type: 'fill', source: 'cei-tanks',
        layout: { visibility: vis },
        paint: { 'fill-color': '#f97316', 'fill-opacity': 0.35 } })
      map.addLayer({ id: 'cei-tanks-line', type: 'line', source: 'cei-tanks',
        layout: { visibility: vis },
        paint: { 'line-color': '#ea580c', 'line-width': 1.5 } })
    }

    if (communityGardens.data && !map.getLayer('gardens-fill')) {
      const vis = visibleLayersRef.current.has('communityGardens') ? 'visible' : 'none'
      map.addLayer({ id: 'gardens-fill', type: 'fill', source: 'community-gardens',
        layout: { visibility: vis },
        paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.3 } })
      map.addLayer({ id: 'gardens-line', type: 'line', source: 'community-gardens',
        layout: { visibility: vis },
        paint: { 'line-color': '#16a34a', 'line-width': 1.5 } })
    }

    if (radioSectors.data && !map.getLayer('radio-sectors-fill')) {
      const vis = visibleLayersRef.current.has('radioSectors') ? 'visible' : 'none'
      map.addLayer({ id: 'radio-sectors-fill', type: 'fill', source: 'radio-sectors',
        layout: { visibility: vis },
        paint: { 'fill-color': '#0d9488', 'fill-opacity': 0.12 } })
      map.addLayer({ id: 'radio-sectors-line', type: 'line', source: 'radio-sectors',
        layout: { visibility: vis },
        paint: { 'line-color': '#0f766e', 'line-width': 1.5, 'line-dasharray': [4, 2] } })
      map.addLayer({ id: 'radio-sectors-label', type: 'symbol', source: 'radio-sectors',
        layout: {
          visibility: vis,
          'text-field': ['get', 'Radio_Training_Sector'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#134e4a',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5,
        },
        minzoom: 10,
      })
    }

    // if (unsafeBuildings.data && !map.getLayer('unsafe-fill')) {
    //   const vis = visibleLayersRef.current.has('unsafeBuildings') ? 'visible' : 'none'
    //   map.addLayer({ id: 'unsafe-fill', type: 'fill', source: 'unsafe-buildings',
    //     layout: { visibility: vis },
    //     paint: { 'fill-color': '#b91c1c', 'fill-opacity': 0.45 } })
    //   map.addLayer({ id: 'unsafe-line', type: 'line', source: 'unsafe-buildings',
    //     layout: { visibility: vis },
    //     paint: { 'line-color': '#991b1b', 'line-width': 1.5 } })
    // }

    // Point layers — pre-colored Maki icons (color + white stroke baked into image)
    const pointLayers: Array<{ sourceId: string; layerId: string; layerKey: LayerId }> = [
      { sourceId: 'beecn',             layerId: 'beecn-points',     layerKey: 'beecn' },
      { sourceId: 'fire-stations',     layerId: 'fire-points',      layerKey: 'fireStations' },
      { sourceId: 'hospitals',         layerId: 'hospital-points',  layerKey: 'hospitals' },
      { sourceId: 'grocery-stores',    layerId: 'grocery-points',   layerKey: 'groceryStores' },
      { sourceId: 'schools',           layerId: 'school-points',    layerKey: 'schools' },
      { sourceId: 'community-centers', layerId: 'community-points', layerKey: 'communityCenters' },
      { sourceId: 'police',            layerId: 'police-points',    layerKey: 'police' },
      { sourceId: 'hazardous-sites',   layerId: 'hazardous-points', layerKey: 'hazardousSites' },
    ]

    for (const { sourceId, layerId, layerKey } of pointLayers) {
      if (map.getSource(sourceId) && !map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'symbol',
          source: sourceId,
          layout: {
            visibility: visibleLayersRef.current.has(layerKey) ? 'visible' : 'none',
            'icon-image': `pdx-${layerKey}`,
            'icon-size': 1.0,
            'icon-allow-overlap': false,
          },
        })
      }
    }

    // Single global click handler — point layers take priority over polygon layers
    if (!map['_pdxClickHandlerAdded' as keyof maplibregl.Map]) {
      (map as unknown as Record<string, unknown>)['_pdxClickHandlerAdded'] = true

      const pointLayerIds = pointLayers.map(l => l.layerId)

      map.on('click', (e) => {
        // Query point layers first (higher priority)
        const pointFeatures = map.queryRenderedFeatures(e.point, { layers: pointLayerIds.filter(id => map.getLayer(id)) })
        if (pointFeatures.length > 0) {
          const feature = pointFeatures[0]
          const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
          const props = feature.properties as Record<string, unknown>
          popupRef.current?.remove()
          popupRef.current = new maplibregl.Popup({ maxWidth: '280px' })
            .setLngLat(coords)
            .setHTML(buildPopup(feature.layer?.id ?? '', props))
            .addTo(map)
          return
        }

        // Fall back to polygon layers in priority order (smaller/more specific first)
        const polygonLayers = ['unsafe-fill', 'cei-tanks-fill', 'gardens-fill', 'radio-sectors-fill', 'net-areas-fill']
          .filter(id => map.getLayer(id))
        for (const layerId of polygonLayers) {
          const features = map.queryRenderedFeatures(e.point, { layers: [layerId] })
          if (features.length > 0) {
            const props = features[0].properties as Record<string, unknown>
            popupRef.current?.remove()
            popupRef.current = new maplibregl.Popup({ maxWidth: '300px' })
              .setLngLat(e.lngLat)
              .setHTML(buildPopup(layerId, props))
              .addTo(map)
            break
          }
        }
      })

      // Cursor: pointer when hovering any interactive layer
      const allInteractiveLayers = [...pointLayerIds, 'unsafe-fill', 'cei-tanks-fill', 'gardens-fill', 'radio-sectors-fill', 'net-areas-fill']
      map.on('mousemove', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: allInteractiveLayers.filter(id => map.getLayer(id)),
        })
        map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : ''
      })
    }
  }, [
    mapLoaded,
    netAreas.data, beecn.data, fireStations.data, hospitals.data,
    groceryStores.data, schools.data, communityCenters.data,
    police.data, neighborhoods.data, hazardousSites.data,
    ceiTanks.data, /*unsafeBuildings.data,*/ communityGardens.data, radioSectors.data,
  ])

  // Sync channel + district filters on NET area layers
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const clauses = []
    if (channelFilter !== null) clauses.push(['==', ['get', 'Channel_Primary'], channelFilter])
    if (districtFilter !== null) clauses.push(['==', ['get', 'Council_District'], districtFilter])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = clauses.length === 0 ? null
      : clauses.length === 1 ? clauses[0]
      : ['all', ...clauses]
    for (const id of ['net-areas-fill', 'net-areas-line', 'net-areas-label']) {
      if (map.getLayer(id)) map.setFilter(id, filter)
    }
  }, [channelFilter, districtFilter, mapLoaded])

  // Sync layer visibility
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const layerMap: Record<LayerId, string[]> = {
      netAreas:         ['net-areas-fill', 'net-areas-line', 'net-areas-label'],
      beecn:            ['beecn-points'],
      fireStations:     ['fire-points'],
      hospitals:        ['hospital-points'],
      groceryStores:    ['grocery-points'],
      schools:          ['school-points'],
      communityCenters: ['community-points'],
      police:           ['police-points'],
      neighborhoods:    ['neighborhoods-line', 'neighborhoods-label'],
      hazardousSites:   ['hazardous-points'],
      ceiTanks:         ['cei-tanks-fill', 'cei-tanks-line'],
      // unsafeBuildings:  ['unsafe-fill', 'unsafe-line'],
      communityGardens: ['gardens-fill', 'gardens-line'],
      radioSectors:     ['radio-sectors-fill', 'radio-sectors-line', 'radio-sectors-label'],
    }

    for (const [key, mapboxIds] of Object.entries(layerMap) as [LayerId, string[]][]) {
      const visibility = visibleLayers.has(key) ? 'visible' : 'none'
      for (const id of mapboxIds) {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, 'visibility', visibility)
        }
      }
    }
  }, [visibleLayers, mapLoaded])

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0 }}
    />
  )
}
