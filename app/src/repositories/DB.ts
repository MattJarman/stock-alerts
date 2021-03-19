import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import Config from 'config'

export default abstract class DB {
  protected readonly db: DynamoDBClient

  protected constructor () {
    this.db = new DynamoDBClient(Config.get('dynamodb'))
  }
}
