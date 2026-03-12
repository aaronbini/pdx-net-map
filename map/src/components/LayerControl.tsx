import { useState } from 'react'
import type { LayerId } from '../types'
import { LAYER_CONFIGS, LAYER_GROUPS } from '../constants/layers'
import { LAYER_ICONS } from '../constants/icons'

function makeSvgUrl(svg: string, color: string, size: number): string {
  const colored = svg
    .replace(/\s+width="[^"]*"/, '')
    .replace(/\s+height="[^"]*"/, '')
    .replace(
      /<svg/,
      `<svg width="${size}" height="${size}" fill="${color}" stroke="white" stroke-width="2" stroke-linejoin="round" paint-order="stroke fill"`
    )
  return `data:image/svg+xml,${encodeURIComponent(colored)}`
}
import {
  useNetAreas, useBeecn, useFireStations, useHospitals,
  useGroceryStores, useSchools, useCommunityCenters,
  usePolice, useNeighborhoods, useHazardousSites,
  useCeiTanks, /*useUnsafeBuildings,*/ useCommunityGardens, useRadioSectors,
} from '../hooks/useArcGIS'

const LOGO_URL = 'https://www.arcgis.com/sharing/rest/content/items/b60507fbce994d49b441452afec724b9/resources/images/widget_4/1649960068941.png'

const CHANNELS = [2, 3, 4, 5, 6, 7, 15, 16, 17, 18, 20, 22]

const NET_LEGEND = [
  { color: '#3b82f6', label: 'Active' },
  { color: '#64748b', label: 'Inactive' },
  { color: '#a78bfa', label: 'Outside Portland' },
]

interface Props {
  visibleLayers: Set<LayerId>
  onToggle: (id: LayerId) => void
  channelFilter: number | null
  onChannelFilter: (ch: number | null) => void
  districtFilter: number | null
  onDistrictFilter: (d: number | null) => void
  offlineReady: boolean
}

function useLoadingStates(): Record<LayerId, boolean> {
  return {
    netAreas:         useNetAreas().isLoading,
    beecn:            useBeecn().isLoading,
    fireStations:     useFireStations().isLoading,
    hospitals:        useHospitals().isLoading,
    groceryStores:    useGroceryStores().isLoading,
    schools:          useSchools().isLoading,
    communityCenters: useCommunityCenters().isLoading,
    police:           usePolice().isLoading,
    neighborhoods:    useNeighborhoods().isLoading,
    hazardousSites:   useHazardousSites().isLoading,
    ceiTanks:         useCeiTanks().isLoading,
    // unsafeBuildings:  useUnsafeBuildings().isLoading,
    communityGardens: useCommunityGardens().isLoading,
    radioSectors:     useRadioSectors().isLoading,
  }
}

function useErrorStates(): Record<LayerId, boolean> {
  return {
    netAreas:         !!useNetAreas().error,
    beecn:            !!useBeecn().error,
    fireStations:     !!useFireStations().error,
    hospitals:        !!useHospitals().error,
    groceryStores:    !!useGroceryStores().error,
    schools:          !!useSchools().error,
    communityCenters: !!useCommunityCenters().error,
    police:           !!usePolice().error,
    neighborhoods:    !!useNeighborhoods().error,
    hazardousSites:   !!useHazardousSites().error,
    ceiTanks:         !!useCeiTanks().error,
    // unsafeBuildings:  !!useUnsafeBuildings().error,
    communityGardens: !!useCommunityGardens().error,
    radioSectors:     !!useRadioSectors().error,
  }
}

export function LayerControl({ visibleLayers, onToggle, channelFilter, onChannelFilter, districtFilter, onDistrictFilter, offlineReady }: Props) {
  const loading = useLoadingStates()
  const errors = useErrorStates()
  const [mobileOpen, setMobileOpen] = useState(false)

  const panelContent = (
    <>
      {/* Header */}
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <img src={LOGO_URL} alt="Portland NET" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', lineHeight: 1.2 }}>Portland NET Map</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Neighborhood Emergency Teams</div>
        </div>
      </div>

      {/* Layer toggles hint */}
      <div style={{ padding: '7px 16px 0', fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>
        Click a layer to show or hide it
      </div>

      {/* Layer toggles */}
      <div style={{ padding: '10px 16px' }}>
        {LAYER_GROUPS.map(group => {
          const groupLayers = LAYER_CONFIGS.filter(l => l.group === group)
          return (
            <div key={group} style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 5,
              }}>
                {group}
              </div>

              {groupLayers.map(layer => {
                const isVisible = visibleLayers.has(layer.id)
                const isLoading = loading[layer.id]
                const hasError = errors[layer.id]
                const isNet = layer.id === 'netAreas'

                return (
                  <div key={layer.id}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '3px 0', cursor: 'pointer',
                      color: isVisible ? '#0f172a' : '#94a3b8',
                      userSelect: 'none',
                    }}>
                      <input type="checkbox" checked={isVisible} onChange={() => onToggle(layer.id)} style={{ display: 'none' }} />
                      {LAYER_ICONS[layer.id] ? (
                        <img
                          src={makeSvgUrl(LAYER_ICONS[layer.id]!, isVisible ? layer.color : '#cbd5e1', 14)}
                          width={14} height={14}
                          style={{ flexShrink: 0, display: 'block' }}
                          alt=""
                        />
                      ) : (
                        <span style={{
                          width: 12, height: 12, flexShrink: 0,
                          borderRadius: layer.id === 'neighborhoods' || isNet ? 2 : '50%',
                          background: isVisible ? layer.color : '#e2e8f0',
                          border: layer.id === 'neighborhoods' ? `2px dashed ${isVisible ? layer.color : '#e2e8f0'}` : 'none',
                          boxSizing: 'border-box',
                        }} />
                      )}
                      <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {layer.label}
                        {layer.id === 'beecn' && (
                          <a
                            href="https://www.portland.gov/pbem/about-beecn"
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            title="What is a BEECN?"
                            style={{ fontSize: 11, color: '#0f172a', lineHeight: 1, textDecoration: 'none' }}
                          >ⓘ</a>
                        )}
                      </span>
                      {isLoading && <span style={{ fontSize: 10, color: '#94a3b8' }}>…</span>}
                      {hasError && <span style={{ fontSize: 10, color: '#ef4444' }} title="Failed to load">✕</span>}
                    </label>

                    {/* NET-specific: status legend + channel filter */}
                    {isNet && isVisible && (
                      <div style={{ marginLeft: 20, marginTop: 4 }}>
                        {/* Status legend */}
                        {NET_LEGEND.map(({ color, label }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0', fontSize: 11, color: '#64748b' }}>
                            <span style={{
                              display: 'inline-block', width: 10, height: 10,
                              borderRadius: 2, background: color, opacity: 0.8, flexShrink: 0,
                            }} />
                            {label}
                          </div>
                        ))}

                        {/* District filter */}
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Filter by district
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {[1, 2, 3, 4].map(d => {
                              const active = districtFilter === d
                              return (
                                <button
                                  key={d}
                                  onClick={() => onDistrictFilter(d)}
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: 11,
                                    fontWeight: active ? 700 : 400,
                                    borderRadius: 4,
                                    border: `1px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
                                    background: active ? '#3b82f6' : '#f8fafc',
                                    color: active ? '#fff' : '#475569',
                                    cursor: 'pointer',
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {d}
                                </button>
                              )
                            })}
                            {districtFilter !== null && (
                              <button
                                onClick={() => onDistrictFilter(null)}
                                style={{
                                  padding: '2px 6px', fontSize: 11,
                                  borderRadius: 4, border: '1px solid #e2e8f0',
                                  background: '#f8fafc', color: '#94a3b8',
                                  cursor: 'pointer', lineHeight: 1.6,
                                }}
                              >
                                ✕ clear
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Channel filter */}
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Filter by channel
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {CHANNELS.map(ch => {
                              const active = channelFilter === ch
                              return (
                                <button
                                  key={ch}
                                  onClick={() => onChannelFilter(ch)}
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: 11,
                                    fontWeight: active ? 700 : 400,
                                    borderRadius: 4,
                                    border: `1px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
                                    background: active ? '#3b82f6' : '#f8fafc',
                                    color: active ? '#fff' : '#475569',
                                    cursor: 'pointer',
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {ch}
                                </button>
                              )
                            })}
                            {channelFilter !== null && (
                              <button
                                onClick={() => onChannelFilter(null)}
                                style={{
                                  padding: '2px 6px', fontSize: 11,
                                  borderRadius: 4, border: '1px solid #e2e8f0',
                                  background: '#f8fafc', color: '#94a3b8',
                                  cursor: 'pointer', lineHeight: 1.6,
                                }}
                              >
                                ✕ clear
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Links */}
      <div style={{ padding: '10px 16px 12px', borderTop: '1px solid #e2e8f0', fontSize: 12, lineHeight: 1.9 }}>
        <a href="https://volunteerpdx.net/index.php/Teams" target="_blank" rel="noreferrer"
          style={{ display: 'block', color: '#3b82f6', textDecoration: 'none' }}>
          Neighborhood Teams Wiki →
        </a>
        <a href="https://www.portland.gov/pbem/neighborhood-emergency-teams" target="_blank" rel="noreferrer"
          style={{ display: 'block', color: '#3b82f6', textDecoration: 'none' }}>
          Portland NET Homepage →
        </a>
        <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11 }}>
          Data: Portland Bureau of Emergency Management
        </div>
      </div>

      {/* Offline status */}
      <div style={{
        padding: '6px 16px 10px',
        borderTop: '1px solid #e2e8f0',
        fontSize: 11,
        color: offlineReady ? '#22c55e' : '#94a3b8',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <span style={{ fontSize: 8 }}>{offlineReady ? '●' : '○'}</span>
        {offlineReady ? 'Offline ready' : 'Caching for offline…'}
      </div>
    </>
  )

  const panelStyles: React.CSSProperties = {
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    width: 224,
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 13,
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        ...panelStyles,
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
        // Hide on small screens
        display: 'var(--layer-control-desktop-display, block)' as React.CSSProperties['display'],
      }}
        className="layer-control-desktop"
      >
        {panelContent}
      </aside>

      {/* Mobile: floating button + bottom drawer */}
      <button
        className="layer-control-fab"
        onClick={() => setMobileOpen(o => !o)}
        aria-label={mobileOpen ? 'Close layers' : 'Open layers'}
        style={{
          display: 'none', // shown via CSS on mobile
          position: 'fixed',
          bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          left: '1rem',
          zIndex: 20,
          background: '#3b82f6',
          color: '#fff',
          borderRadius: '50%',
          width: 48, height: 48,
          border: 'none',
          fontSize: 20,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      <aside
        className="layer-control-drawer"
        style={{
          display: 'none', // shown via CSS on mobile
          ...panelStyles,
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          borderRadius: '16px 16px 0 0',
          maxHeight: '70vh',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 19,
          transform: mobileOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        {panelContent}
      </aside>

      <style>{`
        @media (max-width: 639px) {
          .layer-control-desktop { display: none !important; }
          .layer-control-fab { display: flex !important; }
          .layer-control-drawer { display: block !important; }
        }
      `}</style>
    </>
  )
}
