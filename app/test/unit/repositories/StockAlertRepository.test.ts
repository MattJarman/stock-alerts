import MockDate from 'mockdate'
import { BatchGetItemOutput } from '@aws-sdk/client-dynamodb'
import { StockAlert } from '../../../src/interfaces/repositories/StockAlertRepository'
import StockAlertRepository from '../../../src/repositories/StockAlertRepository'

const tableName = 'ddb-t-ew1-stock-alerts'
const testDate = new Date('2021-01-01')
MockDate.set(testDate)

const sendMock = jest.fn()
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: sendMock
  })),
  BatchGetItemCommand: jest.fn()
}))

describe('Test StockAlertRepository', () => {
  beforeEach(() => {
    process.env.STOCK_ALERTS_TABLE_NAME = tableName
  })

  describe('.constructor()', () => {
    it('throws an error if the STOCK_ALERTS_TABLE_NAME env variable is not defined', () => {
      expect(() => {
        process.env.STOCK_ALERTS_TABLE_NAME = ''

        // eslint-disable-next-line no-new
        new StockAlertRepository()
      }).toThrow(new Error('Stock Alerts table name is not set.'))
    })
  })

  describe('.batchGet()', () => {
    it('formats and returns the StockAlerts on a successful request', async () => {
      const expected = {
        lastSent: '2021-03-20T18:36:05.851Z',
        product: '3080',
        source: 'Nvidia'
      }

      const output: BatchGetItemOutput = {
        Responses: {
          [tableName]: [
            {
              last_sent: { S: expected.lastSent },
              product: { S: expected.product },
              source: { S: expected.source }
            }
          ]
        }
      }

      sendMock.mockReturnValue(output)

      const repo = new StockAlertRepository()
      const actual = await repo.batchGet([{ product: expected.product, source: expected.source }])

      expect(actual).toEqual([
        {
          product: expected.product,
          source: expected.source,
          last_sent: expected.lastSent
        }
      ])
    })

    it('returns an empty array if Reponses is undefined', async () => {
      const output: BatchGetItemOutput = {
        Responses: undefined
      }

      sendMock.mockReturnValue(output)

      const repo = new StockAlertRepository()
      const actual = await repo.batchGet([{ product: '3080', source: 'Nvidia' }])

      expect(actual).toEqual([])
    })
  })

  describe('.getAlertsToSend()', () => {
    it('returns product if no stock alert with matching product and source is found in DB', () => {
      const periodInMinutes = 360
      const productsInStock = [{
        product: '3080',
        source: 'Nvidia',
        inStock: true,
        url: ''
      }]

      const stockAlerts: StockAlert[] = []
      const expected = productsInStock

      const result = StockAlertRepository.getAlertsToSend(productsInStock, stockAlerts, periodInMinutes)
      expect(result).toEqual(expected)
    })

    it('returns product if a stock alert with a matching product and source was found, and the time to send alert after is less than the current time', () => {
      const periodInMinutes = 360
      const productsInStock = [{
        product: '3080',
        source: 'Nvidia',
        inStock: true,
        url: ''
      }]

      const stockAlerts = [{
        product: '3080',
        source: 'Nvidia',
        last_sent: new Date(1).toISOString()
      }]
      const expected = productsInStock

      const result = StockAlertRepository.getAlertsToSend(productsInStock, stockAlerts, periodInMinutes)
      expect(result).toEqual(expected)
    })

    it('does not return product if a stock alert with a matching product and source was found, but the time to send alert after is greater than the current time', () => {
      const periodInMinutes = 360
      const productsInStock = [{
        product: '3080',
        source: 'Nvidia',
        inStock: true,
        url: ''
      }]

      const stockAlerts = [{
        product: '3080',
        source: 'Nvidia',
        last_sent: new Date(testDate.getTime() - (periodInMinutes - 1) * 60000).toISOString()
      }]

      const expected: StockAlert[] = []

      const result = StockAlertRepository.getAlertsToSend(productsInStock, stockAlerts, periodInMinutes)
      expect(result).toEqual(expected)
    })
  })
})
