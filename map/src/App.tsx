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
    // Service workers aren't supported in all browsers (e.g. some older mobile browsers)
    if (!('serviceWorker' in navigator)) return

    // If a service worker is already controlling this page, the app was previously
    // installed and cached — we're ready to work offline right now.
    const hadController = !!navigator.serviceWorker.controller
    if (hadController) setOfflineReady(true)

    // 'controllerchange' fires when a new service worker takes over from the old one.
    // This happens after a deployment: the new SW installs in the background, then
    // activates and claims this page. At that point we reload so the user gets the
    // new version of the app rather than the stale JS/CSS still in memory.
    // The `hadController` guard prevents a reload on the very first install, when
    // there was no previous SW and 'controllerchange' fires for the first time.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      setOfflineReady(true)
      if (hadController) window.location.reload()
    })

    // Fallback: the SW can also signal readiness via a postMessage. Not currently
    // sent by our sw.ts, but kept here as a safety net.
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
