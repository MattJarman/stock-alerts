import { router } from '../../src/Router'
import Amazon from '../../src/sources/Amazon'
import Nvidia from '../../src/sources/Nvidia'
import Source from '../../src/sources/Source'
import StockAlertRepository from '../../src/repositories/StockAlertRepository'
import StockAlertsSender from '../../src/helpers/StockAlertsSender'
import Mock = jest.Mock;

const browserMock = jest.fn()
const browserCloseMock = jest.fn()
jest.mock('puppeteer', () => ({
  launch: browserMock.mockImplementation(() => ({
    close: browserCloseMock
  }))
}))
jest.mock('../../src/helpers/Logger')
jest.mock('../../src/repositories/StockAlertRepository')
const StockAlertsRepositoryMock = StockAlertRepository as unknown as Mock
const batchGetMock = jest.fn()
const updateMock = jest.fn()
StockAlertsRepositoryMock.mockImplementation(() => ({
  batchGet: batchGetMock,
  update: updateMock
}))

jest.mock('../../src/sources/Source')
const SourceMock = Source as unknown as Mock
const findMock = jest.fn()
const setBrowserInstanceMock = jest.fn()
SourceMock.mockImplementation(() => ({
  find: findMock,
  setBrowserInstance: setBrowserInstanceMock
}))

jest.mock('../../src/helpers/StockAlertsSender')
const StockAlertsSenderMock = StockAlertsSender as unknown as Mock
const sendMock = jest.fn()
StockAlertsSenderMock.mockImplementation(() => ({
  send: sendMock
}))

describe('Test Router', () => {
  it('returns true if stock was found for at least one product', async () => {
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

    const actual = await router([
      new Nvidia({
        productName: '3080',
        productUrl: '3080'
      }),
      new Amazon({
        productName: 'PS5',
        productUrl: 'PS5'
      })
    ])()

    expect(setBrowserInstanceMock).toHaveBeenCalledTimes(2)
    expect(browserCloseMock).toHaveBeenCalled()
    expect(batchGetMock).toHaveBeenCalledWith([{
      product: '3080',
      source: 'Nvidia'
    }])
    expect(actual).toEqual(true)
    expect(updateMock).toHaveBeenCalledTimes(1)
  })

  it('does not update the alerts in the database if the alert fails to send', async () => {
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

    const actual = await router([
      new Nvidia({
        productName: '3080',
        productUrl: '3080'
      })
    ])()

    expect(setBrowserInstanceMock).toHaveBeenCalledTimes(1)
    expect(browserCloseMock).toHaveBeenCalled()
    expect(batchGetMock).toHaveBeenCalledWith([{
      product: '3080',
      source: 'Nvidia'
    }])
    expect(actual).toEqual(true)
    expect(updateMock).toHaveBeenCalledTimes(0)
  })

  it('returns false if no stock was found for any product', async () => {
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

    const actual = await router([
      new Nvidia({
        productName: '3080',
        productUrl: '3080'
      }),
      new Amazon({
        productName: 'PS5',
        productUrl: 'PS5'
      })
    ])()

    expect(setBrowserInstanceMock).toHaveBeenCalledTimes(2)
    expect(browserCloseMock).toHaveBeenCalled()
    expect(batchGetMock).toHaveBeenCalledTimes(0)
    expect(actual).toEqual(false)
  })
})
