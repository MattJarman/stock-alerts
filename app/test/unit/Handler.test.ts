import { handler } from '../../src/Handler'

describe('Test Handler', () => {
  test('The handler handles', async () => {
    const actual = await handler()
    expect(actual).toEqual(true)
  })
})
