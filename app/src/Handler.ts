import { SourceResult } from './interfaces/sources/Source'
import Nvidia from './sources/Nvidia'

export const handler = async (): Promise<boolean> => {
  const source = new Nvidia({
    productName: '3080',
    productUrl: 'geforce/store/gpu/?page=1&limit=9&locale=en-gb&category=GPU&gpu=RTX 3080'
  })

  const promises: Promise<SourceResult>[] = [source.find()]

  const result = await Promise.all(promises)
  console.log(result)

  return true
}
