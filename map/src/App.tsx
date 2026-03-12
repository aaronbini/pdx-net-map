import { useState, useCallback, useEffect } from 'react'
import { Map } from './components/Map'
import { LayerControl } from './components/LayerControl'
import { DEFAULT_VISIBLE } from './constants/layers'
import type { LayerId } from './types'

export default function App() {
  const [visibleLayers, setVisibleLayers] = useState<Set<LayerId>>(DEFAULT_VISIBLE)
  const [channelFilter, setChannelFilter] = useState<number | null>(null)
  const [districtFilter, setDistrictFilter] = useState<number | null>(null)
  const [offlineReady, setOfflineReady] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    if (navigator.serviceWorker.controller) setOfflineReady(true)
    navigator.serviceWorker.addEventListener('message', (e) => {
      if ((e.data as { type?: string } | null)?.type === 'OFFLINE_READY') setOfflineReady(true)
    })
  }, [])

  const handleToggle = useCallback((id: LayerId) => {
    setVisibleLayers(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleChannelFilter = useCallback((ch: number | null) => {
    setChannelFilter(prev => prev === ch ? null : ch)
  }, [])

  const handleDistrictFilter = useCallback((d: number | null) => {
    setDistrictFilter(prev => prev === d ? null : d)
  }, [])

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
      <Map visibleLayers={visibleLayers} channelFilter={channelFilter} districtFilter={districtFilter} />
      <LayerControl
        visibleLayers={visibleLayers}
        onToggle={handleToggle}
        channelFilter={channelFilter}
        onChannelFilter={handleChannelFilter}
        districtFilter={districtFilter}
        onDistrictFilter={handleDistrictFilter}
        offlineReady={offlineReady}
      />
    </div>
  )
}
