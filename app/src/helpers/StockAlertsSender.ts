import { PublishCommand, PublishCommandInput, SNS } from '@aws-sdk/client-sns'
import config from 'config'
import { SourceResult } from '../interfaces/sources/Source'
import Logger from './Logger'

export default class StockAlertsSender {
  private readonly logger: Logger
  private readonly client: SNS
  private readonly topicArn: string

  public constructor () {
    if (!process.env.STOCK_ALERTS_SNS_TOPIC) {
      throw new Error('Stock Alerts SNS Topic ARN is not set.')
    }

    this.logger = new Logger()
    this.client = new SNS(config.get('sns'))
    this.topicArn = process.env.STOCK_ALERTS_SNS_TOPIC
  }

  public async send (results: SourceResult[]): Promise<boolean> {
    if (results.length < 1) {
      this.logger.warn('Results array is empty. Not sending alert.')
      return false
    }

    const message = StockAlertsSender.getMessage(results)

    const params: PublishCommandInput = {
      Message: message,
      TopicArn: this.topicArn
    }

    try {
      await this.client.send(new PublishCommand(params))
    } catch (error) {
      const context = `Params: ${JSON.stringify(params, null, 2)}\r\nError: ${JSON.stringify(error, null, 2)}`
      this.logger.error(`Error sending stock alert.\r\n${context}`)
      return false
    }

    return true
  }

  private static getMessage (results: SourceResult[]): string {
    return 'Products found in stock!\n\n' +
      results.map(result => `${result.product} (${result.source})\n${result.url}`).join('\n\n')
  }
}
