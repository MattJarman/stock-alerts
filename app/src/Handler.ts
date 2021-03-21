import { SourceResult } from './interfaces/sources/Source'
import Smyths from './sources/Smyths'

export const handler = async (): Promise<boolean> => {
  const source = new Smyths({
    productName: 'ps5',
    productUrl: 'video-games-and-tablets/playstation-5/playstation-5-consoles/playstation-5-console/p/191259'
  })

  const promises: Promise<SourceResult>[] = [source.find()]

  const result = await Promise.all(promises)
  console.log(result)

  return true
}
