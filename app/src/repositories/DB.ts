import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import config from 'config'

export default abstract class DB {
  protected readonly db: DynamoDBClient

  protected constructor () {
    this.db = new DynamoDBClient(config.get('dynamodb'))
  }
}
