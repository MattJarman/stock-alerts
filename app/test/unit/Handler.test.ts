import { handler } from '../../src/Handler'
import sources from '../../src/Sources'
import Amazon from '../../src/sources/Amazon'
import Nvidia from '../../src/sources/Nvidia'
import Source from '../../src/sources/Source'
import StockAlertRepository from '../../src/repositories/StockAlertRepository'
import StockAlertsSender from '../../src/helpers/StockAlertsSender'
import Mock = jest.Mock;

const sourcesMock = sources as unknown as Array<Source>
jest.mock('../../src/Sources', () => [])
jest.mock('../../src/helpers/Logger')
jest.mock('../../src/sources/Source')
const SourceMock = Source as unknown as Mock
const findMock = jest.fn()
const closeMock = jest.fn()
SourceMock.mockImplementation(() => ({
  find: findMock,
  close: closeMock
}))

jest.mock('../../src/repositories/StockAlertRepository')
const StockAlertsRepositoryMock = StockAlertRepository as unknown as Mock
const batchGetMock = jest.fn()
const updateMock = jest.fn()
StockAlertsRepositoryMock.mockImplementation(() => ({
  batchGet: batchGetMock,
  update: updateMock
}))

jest.mock('../../src/helpers/StockAlertsSender')
const StockAlertsSenderMock = StockAlertsSender as unknown as Mock
const sendMock = jest.fn()
StockAlertsSenderMock.mockImplementation(() => ({
  send: sendMock
}))

describe('Test Handler', () => {
  afterEach(() => {
    sourcesMock.length = 0
  })

  it('returns true if stock was found for at least one product', async () => {
    const sources = [
      new Nvidia({
        productName: '3080',
        productUrl: '3080'
      }),
      new Amazon({
        productName: 'PS5',
        productUrl: 'PS5'
      })
    ]

    findMock.mockResolvedValueOnce({
      product: '3080',
      url: 'https://shop.nvidia.com/en-gb/3080',
      source: 'Nvidia',
      inStock: true
    })

    findMock.mockResolvedValueOnce({
      product: 'PS5',
      url: 'https://www.amazon.co.uk/PS5',
      source: 'Amazon',
      inStock: false
    })

    batchGetMock.mockResolvedValueOnce([
      {
        product: '3080',
        source: 'Nvidia',
        last_sent: new Date(1)
      }
    ])

    updateMock.mockResolvedValueOnce({
      product: '3080',
      source: 'Nvidia',
      last_sent: new Date(1)
    })

    sendMock.mockResolvedValueOnce(true)

    sources.forEach(source => sourcesMock.push(source))
    const actual = await handler()

    expect(closeMock).toHaveBeenCalledTimes(sources.length)
    expect(batchGetMock).toHaveBeenCalledWith([{
      product: '3080',
      source: 'Nvidia'
    }])
    expect(actual).toEqual(true)
    expect(updateMock).toHaveBeenCalledTimes(1)
  })

  it('does not update the alerts in the database if the alert fails to send', async () => {
    const sources = [
      new Nvidia({
        productName: '3080',
        productUrl: '3080'
      })
    ]

    findMock.mockResolvedValueOnce({
      product: '3080',
      url: 'https://shop.nvidia.com/en-gb/3080',
      source: 'Nvidia',
      inStock: true
    })

    batchGetMock.mockResolvedValueOnce([
      {
        product: '3080',
        source: 'Nvidia',
        last_sent: new Date(1)
      }
    ])

    sendMock.mockResolvedValueOnce(false)

    sources.forEach(source => sourcesMock.push(source))
    const actual = await handler()

    expect(closeMock).toHaveBeenCalledTimes(sources.length)
    expect(batchGetMock).toHaveBeenCalledWith([{
      product: '3080',
      source: 'Nvidia'
    }])
    expect(actual).toEqual(true)
    expect(updateMock).toHaveBeenCalledTimes(0)
  })

  it('returns false if no stock was found for any product', async () => {
    const sources = [
      new Nvidia({
        productName: '3080',
        productUrl: '3080'
      }),
      new Amazon({
        productName: 'PS5',
        productUrl: 'PS5'
      })
    ]

    findMock.mockResolvedValueOnce({
      product: '3080',
      url: 'https://shop.nvidia.com/en-gb/3080',
      source: 'Nvidia',
      inStock: false
    })

    findMock.mockResolvedValueOnce({
      product: 'PS5',
      url: 'https://www.amazon.co.uk/PS5',
      source: 'Amazon',
      inStock: false
    })

    sources.forEach(source => sourcesMock.push(source))

    const actual = await handler()

    expect(closeMock).toHaveBeenCalledTimes(sources.length)
    expect(batchGetMock).toHaveBeenCalledTimes(0)
    expect(actual).toEqual(false)
  })
})
