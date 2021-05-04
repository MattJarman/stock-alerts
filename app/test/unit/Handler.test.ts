import { handler } from '../../src/Handler'
import Nvidia from '../../src/sources/Nvidia'
import Mock = jest.Mock;

const nvidiaFindMock = jest.fn()
const NvidiaMock = Nvidia as Mock
jest.mock('../../src/sources/Nvidia')
NvidiaMock.mockImplementation(() => ({
  find: nvidiaFindMock
}))

describe('Test Handler', () => {
  test('The handler returns true if stock was found for at least one product', async () => {
    nvidiaFindMock.mockResolvedValue({
      product: '3080',
      url: 'https://nvidia-3080-test.com',
      inStock: true
    })

    const actual = await handler()
    expect(actual).toEqual(true)
  })

  test('The handler returns false if stock was not found for any product', async () => {
    nvidiaFindMock.mockResolvedValue({
      product: '3080',
      url: 'https://nvidia-3080-test.com',
      inStock: false
    })

    const actual = await handler()
    expect(actual).toEqual(false)
  })
})
