import {
  CreateTableCommand, DeleteItemCommand, DeleteItemCommandInput, CreateTableCommandInput,
  DeleteTableCommand, GetItemCommand, GetItemCommandInput,
  ListTablesCommand,
  UpdateItemCommand, UpdateItemCommandInput
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { StockAlert } from '../interfaces/repositories/StockAlertRepository'
import DB from './DB'

export default class StockAlertRepository extends DB {
  private readonly tableName: string

  public constructor () {
    super()
    if (!process.env.STOCK_ALERTS_TABLE_NAME) {
      throw new Error('Table name Stock Alerts is not set.')
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

  public async delete (product: string, source: string): Promise<unknown> {
    const params: DeleteItemCommandInput = {
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

    return this.db.send(new DeleteItemCommand(params))
  }

  public async update (product: string, source: string, lastSent: Date = new Date()): Promise<unknown> {
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

  public async listTables (): Promise<unknown> {
    return this.db.send(new ListTablesCommand({}))
  }

  public async createTable (): Promise<unknown> {
    const params: CreateTableCommandInput = {
      TableName: 'ddb-l-ew1-stock-alerts',
      AttributeDefinitions: [
        {
          AttributeName: 'product',
          AttributeType: 'S'
        },
        {
          AttributeName: 'source',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'product',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'source',
          KeyType: 'RANGE'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }

    return this.db.send(new CreateTableCommand(params))
  }

  public async deleteTable (): Promise<unknown> {
    return this.db.send(new DeleteTableCommand({ TableName: this.tableName }))
  }
}
