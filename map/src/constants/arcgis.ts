const BASE = 'https://services.arcgis.com/quVN97tn06YNGj9s/arcgis/rest/services/NETs_Community_Resiliency_WFL1/FeatureServer'
const NET_DIR = 'https://services8.arcgis.com/PeY4XZhsIFEEKEcb/arcgis/rest/services/NET_Directory/FeatureServer/0'
const RADIO_SECTORS = 'https://services8.arcgis.com/PeY4XZhsIFEEKEcb/arcgis/rest/services/Portland_NET_Radio_Training_Liaison_Sectors/FeatureServer/0'

function layerUrl(id: number, where = '1=1', outFields = '*') {
  return `${BASE}/${id}/query?f=geojson&where=${encodeURIComponent(where)}&outFields=${outFields}&outSR=4326`
}

export const ENDPOINTS = {
  beecn:           layerUrl(0),
  fireStations:    layerUrl(1),
  hazardousSites:  layerUrl(6, '1=1', 'Facility_Name,Site_Address,City,Chemical_Name,First_Hazard_Class_Description,Business_Type'),
  hospitals:       layerUrl(7),
  groceryStores:   layerUrl(8, "STATUS<>'Closed'"),
  schools:         layerUrl(9, '1=1', 'NAME,ADDRESS,CITY,ZIPCODE,PHONE,DISTRICT,LEVEL_NAME,TYPE'),
  communityCenters:layerUrl(11),
  neighborhoods:   layerUrl(13, '1=1', 'NAME,COMMPLAN,COALIT,MAPLABEL'),
  police:          layerUrl(27),
  netAreas:        `${NET_DIR}/query?f=geojson&where=1%3D1&outFields=*&outSR=4326`,
  // unsafeBuildings: layerUrl(4),
  communityGardens:layerUrl(12),
  ceiTanks:        layerUrl(18),
  radioSectors:    `${RADIO_SECTORS}/query?f=geojson&where=1%3D1&outFields=Radio_Training_Sector,Radio_Training_Lisison,Radio_Training_Liaison_Email,Radio_Training_Liaison_CallSign&outSR=4326`,
}
