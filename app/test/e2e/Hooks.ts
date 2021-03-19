import {
  CreateTableCommand,
  CreateTableCommandInput,
  CreateTableOutput, DeleteTableCommand,
  DeleteTableOutput
} from '@aws-sdk/client-dynamodb'
import { after, before, binding } from 'cucumber-tsflow'
import DB from '../../src/repositories/DB'

@binding()
export class Hooks extends DB {
  private readonly TABLE_NAME: string

  public constructor () {
    super()
    if (!process.env.STOCK_ALERTS_TABLE_NAME) {
      throw new Error('Environment variable \'STOCK_ALERTS_TABLE_NAME\' is not set.')
    }

    this.TABLE_NAME = process.env.STOCK_ALERTS_TABLE_NAME
  }

  @before()
  public async before (): Promise<void> {
    await this.createTables()
  }

  @after()
  public async after (): Promise<void> {
    await this.dropTables()
  }

  private async createTables (): Promise<CreateTableOutput> {
    const params: CreateTableCommandInput = {
      TableName: this.TABLE_NAME,
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

  private async dropTables (): Promise<DeleteTableOutput> {
    return this.db.send(new DeleteTableCommand({ TableName: this.TABLE_NAME }))
  }
}
