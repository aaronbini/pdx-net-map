import { useQuery } from '@tanstack/react-query'
import { ENDPOINTS } from '../constants/arcgis'

async function fetchGeoJSON(url: string): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`ArcGIS fetch failed: ${res.status} ${url}`)
  return res.json()
}

function useLayer(key: string, url: string) {
  return useQuery<GeoJSON.FeatureCollection>({
    queryKey: [key],
    queryFn: () => fetchGeoJSON(url),
  })
}

export function useNetAreas()         { return useLayer('netAreas',         ENDPOINTS.netAreas) }
export function useBeecn()            { return useLayer('beecn',            ENDPOINTS.beecn) }
export function useFireStations()     { return useLayer('fireStations',     ENDPOINTS.fireStations) }
export function useHospitals()        { return useLayer('hospitals',         ENDPOINTS.hospitals) }
export function useGroceryStores()    { return useLayer('groceryStores',    ENDPOINTS.groceryStores) }
export function useSchools()          { return useLayer('schools',           ENDPOINTS.schools) }
export function useCommunityCenters() { return useLayer('communityCenters', ENDPOINTS.communityCenters) }
export function usePolice()           { return useLayer('police',            ENDPOINTS.police) }
export function useNeighborhoods()    { return useLayer('neighborhoods',     ENDPOINTS.neighborhoods) }
export function useHazardousSites()   { return useLayer('hazardousSites',   ENDPOINTS.hazardousSites) }
export function useCeiTanks()         { return useLayer('ceiTanks',         ENDPOINTS.ceiTanks) }
export function useUnsafeBuildings()  { return useLayer('unsafeBuildings',  ENDPOINTS.unsafeBuildings) }
export function useCommunityGardens() { return useLayer('communityGardens', ENDPOINTS.communityGardens) }
