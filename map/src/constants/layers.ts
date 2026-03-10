import type { LayerConfig, LayerId } from '../types'

export const LAYER_CONFIGS: LayerConfig[] = [
  { id: 'netAreas',         label: 'NET Areas',           color: '#3b82f6', group: 'NET', description: 'Neighborhood Emergency Team response areas' },
  { id: 'beecn',            label: 'BEECN Sites',         color: '#f97316', group: 'Emergency', description: 'Basic Earthquake Emergency Communication Nodes' },
  { id: 'fireStations',     label: 'Fire Stations',       color: '#ef4444', group: 'Emergency' },
  { id: 'hospitals',        label: 'Hospitals',           color: '#10b981', group: 'Emergency' },
  { id: 'police',           label: 'Police Facilities',   color: '#4f46e5', group: 'Emergency' },
  { id: 'groceryStores',    label: 'Grocery Stores',      color: '#84cc16', group: 'Community' },
  { id: 'schools',          label: 'Schools',             color: '#7c3aed', group: 'Community' },
  { id: 'communityCenters', label: 'Community Centers',   color: '#0891b2', group: 'Community' },
  { id: 'neighborhoods',    label: 'Neighborhood Boundaries', color: '#94a3b8', group: 'Geography' },
  { id: 'hazardousSites',   label: 'Hazardous Sites',     color: '#db2777', group: 'Hazards', description: 'Extremely Hazardous Substance facilities' },
  { id: 'ceiTanks',        label: 'CEI Hub Tanks',       color: '#c2410c', group: 'Hazards', description: 'Industrial petroleum & chemical storage tanks' },
  { id: 'unsafeBuildings', label: 'Unsafe Buildings',    color: '#92400e', group: 'Hazards', description: 'Portland Fire Bureau-tagged unsafe structures' },
  { id: 'communityGardens',label: 'Community Gardens',   color: '#22c55e', group: 'Community', description: 'Active community gardens — potential staging areas' },
]

export const LAYER_GROUPS = ['NET', 'Emergency', 'Community', 'Geography', 'Hazards']

export const DEFAULT_VISIBLE: Set<LayerId> = new Set([
  'netAreas',
  'beecn',
  'fireStations',
  'hospitals',
  'neighborhoods',
])

export function getLayerConfig(id: LayerId): LayerConfig {
  return LAYER_CONFIGS.find(l => l.id === id)!
}
