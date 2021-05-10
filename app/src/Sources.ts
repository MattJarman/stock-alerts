import Source from './sources/Source'
import Nvidia from './sources/Nvidia'

const sources: Source[] = [
  new Nvidia({
    productName: '3080',
    productUrl: 'geforce/store/gpu/?page=1&limit=9&locale=en-gb&category=GPU&gpu=RTX 3080'
  })
]

export default sources
