import StockAlertsHelper from './helpers/StockAlertsHelper'
import config from 'config'
import sources from './Sources'
import StockAlertRepository from './repositories/StockAlertRepository'

export const handler = async (): Promise<boolean> => {
  const promises = sources.map(source => source.find().finally(() => source.close()))
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
  const toSend = StockAlertsHelper.getAlertsToSend(filtered, alerts, periodInMinutes)

  // TODO: Send SNS notification

  await Promise.all(toSend.map(result => repository.update(result.product, result.source)))

  return true
}
