import { StockAlert } from '../interfaces/repositories/StockAlertRepository'
import { SourceResult } from '../interfaces/sources/Source'

export default class StockAlertsHelper {
  public static getAlertsToSend (
    productsInStock: SourceResult[],
    stockAlerts: StockAlert[],
    periodInMinutes: number
  ): SourceResult[] {
    return productsInStock.filter(result => {
      const alertIndex = stockAlerts.findIndex(alert => alert.source === result.source && alert.product === result.product)

      if (alertIndex === -1) {
        return true
      }

      const lastSent = new Date(stockAlerts[alertIndex].last_sent)
      const shouldSendAfter = new Date(lastSent.getTime() + periodInMinutes * 60000)

      return new Date() > shouldSendAfter
    })
  }
}
