import {
  GetItemCommand,
  GetItemCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemOutput
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { StockAlert } from '../interfaces/repositories/StockAlertRepository'
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

  public async get (product: string, source: string): Promise<StockAlert | false> {
    const params: GetItemCommandInput = {
      TableName: this.tableName,
      Key: {
        product: {
          S: product
        },
        source: {
          S: source
        }
      }
    }

    const { Item } = await this.db.send(new GetItemCommand(params))

    if (!Item) {
      return false
    }

    return unmarshall(Item) as StockAlert
  }

  public async update (product: string, source: string, lastSent: Date = new Date()): Promise<UpdateItemOutput> {
    const params: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: {
        product: {
          S: product
        },
        source: {
          S: source
        }
      },
      UpdateExpression: 'SET last_sent = :last_sent',
      ExpressionAttributeValues: {
        ':last_sent': {
          S: lastSent.toISOString()
        }
      }
    }

    return this.db.send(new UpdateItemCommand(params))
  }
}
