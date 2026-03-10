import { useState, useCallback } from 'react'
import { Map } from './components/Map'
import { LayerControl } from './components/LayerControl'
import { DEFAULT_VISIBLE } from './constants/layers'
import type { LayerId } from './types'

export default function App() {
  const [visibleLayers, setVisibleLayers] = useState<Set<LayerId>>(DEFAULT_VISIBLE)
  const [channelFilter, setChannelFilter] = useState<number | null>(null)

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

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
      <Map visibleLayers={visibleLayers} channelFilter={channelFilter} />
      <LayerControl
        visibleLayers={visibleLayers}
        onToggle={handleToggle}
        channelFilter={channelFilter}
        onChannelFilter={handleChannelFilter}
      />
    </div>
  )
}
