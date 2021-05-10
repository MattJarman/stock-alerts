import { handler } from '../../src/Handler'
import sources from '../../src/Sources'
import Amazon from '../../src/sources/Amazon'
import Nvidia from '../../src/sources/Nvidia'
import Source from '../../src/sources/Source'
import Mock = jest.Mock;

let sourcesMock = sources as unknown as Array<Source>
jest.mock('../../src/Sources', () => [])

const SourceMock = Source as unknown as Mock
jest.mock('../../src/sources/Source')
const findMock = jest.fn()
const closeMock = jest.fn()
SourceMock.mockImplementation(() => ({
  find: findMock,
  close: closeMock
}))

describe('Test Handler', () => {
  afterEach(() => {
    sourcesMock = []
  })

  it('returns true if stock was found for at least one product', async () => {
    const sources = [
      new Nvidia({
        productName: '3080',
        productUrl: '3080'
      }),
      new Amazon({
        productName: 'PS5',
        productUrl: ''
      })
    ]

    findMock.mockResolvedValueOnce({
      product: '3080',
      url: 'https://shop.nvidia.com/en-gb/3080',
      inStock: true
    })

    findMock.mockResolvedValueOnce({
      product: 'PS5',
      url: 'https://www.amazon.co.uk/PS5',
      inStock: false
    })

    sources.forEach(source => sourcesMock.push(source))
    const actual = await handler()
    expect(actual).toEqual(true)

    expect(closeMock).toHaveBeenCalledTimes(sources.length)
  })

  it('returns false if no stock was found for any product', async () => {
    const sources = [
      new Nvidia({
        productName: '3080',
        productUrl: '3080'
      }),
      new Amazon({
        productName: 'PS5',
        productUrl: ''
      })
    ]

    findMock.mockResolvedValueOnce({
      product: '3080',
      url: 'https://shop.nvidia.com/en-gb/3080',
      inStock: false
    })

    findMock.mockResolvedValueOnce({
      product: 'PS5',
      url: 'https://www.amazon.co.uk/PS5',
      inStock: false
    })

    sources.forEach(source => sourcesMock.push(source))

    const actual = await handler()
    expect(actual).toEqual(false)

    expect(closeMock).toHaveBeenCalledTimes(sources.length)
  })
})
