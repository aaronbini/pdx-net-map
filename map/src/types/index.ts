export type LayerId =
  | 'netAreas'
  | 'beecn'
  | 'fireStations'
  | 'hospitals'
  | 'groceryStores'
  | 'schools'
  | 'communityCenters'
  | 'police'
  | 'neighborhoods'
  | 'hazardousSites'
  | 'ceiTanks'
  // | 'unsafeBuildings'  // dataset appears defunct
  | 'communityGardens'
  | 'radioSectors'

export interface LayerConfig {
  id: LayerId
  label: string
  color: string
  group: string
  description?: string
}
