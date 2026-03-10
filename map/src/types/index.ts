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

export interface LayerConfig {
  id: LayerId
  label: string
  color: string
  group: string
  description?: string
}
