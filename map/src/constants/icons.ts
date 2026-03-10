import type { LayerId } from '../types'
import beecnSvg     from '@mapbox/maki/icons/star.svg?raw'
import fireSvg      from '@mapbox/maki/icons/building.svg?raw'
import hospitalSvg  from '@mapbox/maki/icons/hospital.svg?raw'
import grocerySvg   from '@mapbox/maki/icons/grocery.svg?raw'
import schoolSvg    from '@mapbox/maki/icons/school.svg?raw'
import communitySvg from '@mapbox/maki/icons/town-hall.svg?raw'
import policeSvg    from '@mapbox/maki/icons/police.svg?raw'
import dangerSvg    from '@mapbox/maki/icons/danger.svg?raw'

export const LAYER_ICONS: Partial<Record<LayerId, string>> = {
  beecn:            beecnSvg,
  fireStations:     fireSvg,
  hospitals:        hospitalSvg,
  groceryStores:    grocerySvg,
  schools:          schoolSvg,
  communityCenters: communitySvg,
  police:           policeSvg,
  hazardousSites:   dangerSvg,
}
