import { SourceResult } from './interfaces/sources/Source'
import sources from './Sources'

export const handler = async (): Promise<boolean> => {
  const promises: Promise<SourceResult>[] = sources.map(source => source.find().finally(() => source.close()))
  const results = await Promise.all(promises)

  // TODO: Send SNS notification

  return !results.every(result => !result.inStock)
}
