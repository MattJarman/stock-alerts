import { PublishCommand } from '@aws-sdk/client-sns'
import StockAlertsSender from '../../../src/helpers/StockAlertsSender'

jest.mock('../../../src/helpers/Logger')

const sendMock = jest.fn()
jest.mock('@aws-sdk/client-sns', () => ({
  SNS: jest.fn().mockImplementation(() => ({
    send: sendMock
  })),
  PublishCommand: jest.fn()
}))

const topicArn = 'example-topic-arn'

describe('Test StockAlertsSender', () => {
  beforeEach(() => {
    process.env.STOCK_ALERTS_SNS_TOPIC = topicArn
  })

  describe('.constructor()', () => {
    it('throws an error if the STOCK_ALERTS_SNS_TOPIC env variable is not set', () => {
      expect(() => {
        process.env.STOCK_ALERTS_SNS_TOPIC = ''

        // eslint-disable-next-line no-new
        new StockAlertsSender()
      }).toThrow(new Error('Stock Alerts SNS Topic ARN is not set.'))
    })
  })

  describe('.send()', () => {
    it('formats and sends the alert for the specified products', async () => {
      const sender = new StockAlertsSender()
      const actual = await sender.send([
        {
          product: '3080',
          source: 'Nvidia',
          inStock: true,
          url: 'https://localhost.com/nvidia-3080'
        },
        {
          product: 'PS5',
          source: 'Amazon',
          inStock: true,
          url: 'https://localhost.com/amazon-ps5'
        }
      ])

      const expectedMessage = 'Products found in stock!\n\n3080 (Nvidia)\nhttps://localhost.com/nvidia-3080' +
        '\n\nPS5 (Amazon)\nhttps://localhost.com/amazon-ps5'

      expect(actual).toEqual(true)
      expect(sendMock).toHaveBeenCalledTimes(1)
      expect(PublishCommand).toHaveBeenCalledWith({
        Message: expectedMessage,
        TopicArn: topicArn
      })
    })

    it('returns false if an empty array is provided', async () => {
      const sender = new StockAlertsSender()
      const actual = await sender.send([])

      expect(actual).toEqual(false)
      expect(sendMock).toHaveBeenCalledTimes(0)
    })

    it('returns false there was an error sending the alert', async () => {
      const sender = new StockAlertsSender()
      sendMock.mockRejectedValueOnce(new Error('Whoops'))

      const actual = await sender.send([
        {
          product: '3080',
          source: 'Nvidia',
          inStock: true,
          url: 'https://localhost.com/nvidia-3080'
        }
      ])

      expect(actual).toEqual(false)
    })
  })
})
