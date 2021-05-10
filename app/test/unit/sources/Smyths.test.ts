import Smyths from '../../../src/sources/Smyths'

describe('Test Smyths', () => {
  it('creates a new instance of a Smyths source', () => {
    const source = new Smyths({
      productName: 'PS5',
      productUrl: 'video-games-and-tablets/playstation-5/playstation-5-consoles/playstation-5-console/p/191259'
    })

    expect(source).toBeInstanceOf(Smyths)
  })
})
