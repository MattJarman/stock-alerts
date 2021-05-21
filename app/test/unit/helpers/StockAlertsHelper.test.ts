import MockDate from 'mockdate'
import StockAlertsHelper from '../../../src/helpers/StockAlertsHelper'
import { StockAlert } from '../../../src/interfaces/repositories/StockAlertRepository'

const testDate = new Date('2021-01-01')
MockDate.set(testDate)

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

    const result = StockAlertsHelper.getAlertsToSend(productsInStock, stockAlerts, periodInMinutes)
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

    const result = StockAlertsHelper.getAlertsToSend(productsInStock, stockAlerts, periodInMinutes)
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

    const result = StockAlertsHelper.getAlertsToSend(productsInStock, stockAlerts, periodInMinutes)
    expect(result).toEqual(expected)
  })
})
