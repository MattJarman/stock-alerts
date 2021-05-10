import MockDate from 'mockdate'
import { GetItemOutput, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import StockAlertRepository from '../../../src/repositories/StockAlertRepository'

const testDate = new Date('2021-01-01')
MockDate.set(testDate)

const sendMock = jest.fn()
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: sendMock
  })),
  GetItemCommand: jest.fn(),
  UpdateItemCommand: jest.fn()
}))

describe('Test StockAlertRepository', () => {
  beforeEach(() => {
    process.env.STOCK_ALERTS_TABLE_NAME = 'ddb-t-ew1-stock-alerts'
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

  describe('.get()', () => {
    it('formats and returns the StockAlert on a successful request', async () => {
      const output: GetItemOutput = {
        ConsumedCapacity: undefined,
        Item: {
          last_sent: { S: '2021-03-20T18:36:05.851Z' },
          product: { S: 'PS5' },
          source: { S: 'Amazon' }
        }
      }

      sendMock.mockReturnValue(output)

      const repo = new StockAlertRepository()
      const actual = await repo.get('PS5', 'Amazon')

      expect(actual).toEqual({
        product: 'PS5',
        source: 'Amazon',
        last_sent: '2021-03-20T18:36:05.851Z'
      })
    })

    it('returns false if the StockAlert was not found', async () => {
      const output: GetItemOutput = {
        ConsumedCapacity: undefined,
        Item: undefined
      }

      sendMock.mockReturnValue(output)

      const repo = new StockAlertRepository()
      const actual = await repo.get('PS5', 'Amazon')

      expect(actual).toEqual(false)
    })
  })

  describe('.update()', () => {
    it('updates the last_sent date of a StockAlert with a provided date', async () => {
      const repo = new StockAlertRepository()
      const lastSent = new Date('2020-01-01')
      await repo.update('PS5', 'Amazon', lastSent)

      expect(UpdateItemCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          ExpressionAttributeValues: {
            ':last_sent': {
              S: lastSent.toISOString()
            }
          }
        })
      )
    })

    it('updates the last_sent date of a StockAlert to now if no date is provided', async () => {
      const repo = new StockAlertRepository()
      await repo.update('PS5', 'Amazon')

      expect(UpdateItemCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          ExpressionAttributeValues: {
            ':last_sent': {
              S: testDate.toISOString()
            }
          }
        })
      )
    })
  })
})
