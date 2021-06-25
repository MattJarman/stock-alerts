import { router } from './Router'
import Nvidia from './sources/Nvidia'

export const handler = router([
  new Nvidia({
    productName: '3080',
    productUrl: 'geforce/store/gpu/?page=1&limit=9&locale=en-gb&category=GPU&gpu=RTX+3080&manufacturer=NVIDIA&manufacturer_filter=NVIDIA~1,3XS+SYSTEMS~0,ACER~0,AORUS~0,ASUS~3,DELL~0,EVGA~4,GIGABYTE~3,HP~0,INNO3D~0,LENOVO~0,MSI~2,PALIT~2,PNY~1,RAZER~0,ZOTAC~3'
  })
])
