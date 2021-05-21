import {
  BatchGetItemCommand,
  BatchGetItemCommandInput,
  UpdateItemCommand,
  UpdateItemInput
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { BatchGetProductInput, StockAlert } from '../interfaces/repositories/StockAlertRepository'
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

  public async update (product: string, source: string, lastSent = new Date()): Promise<StockAlert | false> {
    const params: UpdateItemInput = {
      TableName: this.tableName,
      Key: marshall({ product: product, source: source }),
      UpdateExpression: 'SET last_sent = :lastSent',
      ExpressionAttributeValues: marshall({ ':lastSent': lastSent.toISOString() }),
      ReturnValues: 'ALL_NEW'
    }

    const { Attributes } = await this.db.send(new UpdateItemCommand(params))

    if (!Attributes) {
      return false
    }

    return unmarshall(Attributes) as StockAlert
  }
}
