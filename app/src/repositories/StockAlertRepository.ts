import { BatchGetItemCommand, BatchGetItemCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { BatchGetProductInput, StockAlert } from '../interfaces/repositories/StockAlertRepository'
import { SourceResult } from '../interfaces/sources/Source'
import DB from './DB'

export default class StockAlertRepository extends DB {
  private readonly tableName: string

  public constructor () {
    super()
    if (!process.env.STOCK_ALERTS_TABLE_NAME) {
      throw new Error('Stock Alerts table name is not set.')
    }

    this.tableName = process.env.STOCK_ALERTS_TABLE_NAME
  }

  public async batchGet (products: BatchGetProductInput[]): Promise<StockAlert[]> {
    const marshalledProducts = products.map(product => marshall(product))

    const params: BatchGetItemCommandInput = {
      RequestItems: {
        [this.tableName]: {
          Keys: marshalledProducts
        }
      }
    }

    const { Responses } = await this.db.send(new BatchGetItemCommand(params))

    if (!Responses) {
      return []
    }

    return Responses[this.tableName].map(response => unmarshall(response)) as StockAlert[]
  }

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
