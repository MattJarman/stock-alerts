import { router } from './Router'
import Nvidia from './sources/Nvidia'

export const handler = router([
  new Nvidia({
    productName: '3080',
    productUrl: 'geforce/store/gpu/?page=1&limit=9&locale=en-gb&category=GPU&gpu=RTX 3080'
  })
])
