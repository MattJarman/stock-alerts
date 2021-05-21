import { BatchGetItemOutput, UpdateItemOutput } from '@aws-sdk/client-dynamodb'
import StockAlertRepository from '../../../src/repositories/StockAlertRepository'

const tableName = 'ddb-t-ew1-stock-alerts'

const sendMock = jest.fn()
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: sendMock
  })),
  BatchGetItemCommand: jest.fn(),
  UpdateItemCommand: jest.fn()
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

    it('returns an empty array if Responses is undefined', async () => {
      const output: BatchGetItemOutput = {
        Responses: undefined
      }

      sendMock.mockReturnValue(output)

      const repo = new StockAlertRepository()
      const actual = await repo.batchGet([{ product: '3080', source: 'Nvidia' }])

      expect(actual).toEqual([])
    })
  })

  describe('.update()', () => {
    it('updates a product\'s last_sent if a date is provided', async () => {
      const date = new Date()
      const expected = {
        last_sent: date.toISOString(),
        product: '3080',
        source: 'Nvidia'
      }

      const output: UpdateItemOutput = {
        Attributes: {
          last_sent: { S: expected.last_sent },
          product: { S: expected.product },
          source: { S: expected.source }
        }
      }

      sendMock.mockReturnValueOnce(output)

      const repo = new StockAlertRepository()
      const actual = await repo.update({ product: '3080', source: 'Nvidia' }, date)

      expect(actual).toEqual(expected)
    })

    it('updates a product\'s last_sent and uses the current date if none provided', async () => {
      const date = new Date()
      const expected = {
        last_sent: date.toISOString(),
        product: '3080',
        source: 'Nvidia'
      }

      const output: UpdateItemOutput = {
        Attributes: {
          last_sent: { S: expected.last_sent },
          product: { S: expected.product },
          source: { S: expected.source }
        }
      }

      sendMock.mockReturnValueOnce(output)

      const repo = new StockAlertRepository()
      const actual = await repo.update({ product: '3080', source: 'Nvidia' })

      expect(actual).toEqual(expected)
    })

    it('returns false if no Attributes are returned', async () => {
      sendMock.mockReturnValueOnce({})

      const repo = new StockAlertRepository()
      const actual = await repo.update({ product: '3080', source: 'Nvidia' })

      expect(actual).toEqual(false)
    })
  })
})
