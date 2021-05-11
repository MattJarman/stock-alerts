import { StockAlert } from './interfaces/repositories/StockAlertRepository'
import { SourceResult } from './interfaces/sources/Source'
import config from 'config'
import sources from './Sources'
import StockAlertRepository from './repositories/StockAlertRepository'

export const handler = async (): Promise<boolean> => {
  const promises: Promise<SourceResult>[] = sources.map(source => source.find().finally(() => source.close()))
  const results = await Promise.all(promises)

  const filtered = results.filter(result => result.inStock)

  if (filtered.length === 0) {
    return false
  }

  const repository = new StockAlertRepository()
  const alerts = await repository.batchGet(filtered.map(result => {
    return { product: result.product, source: result.source }
  }))

  const periodInMinutes: number = config.get('alerts.periodInMinutes')
  const toSend = StockAlertRepository.getAlertsToSend(filtered, alerts, periodInMinutes)

  // TODO: Send SNS notification
  // TODO: Update last_sent times for sent alerts

  return true
}
