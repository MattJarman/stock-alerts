import Nvidia from '../../../src/sources/Nvidia'

describe('Test Nvidia', () => {
  it('creates a new instance of an Nvidia source', () => {
    const source = new Nvidia({
      productName: '3080',
      productUrl: 'geforce/store/gpu/?page=1&limit=9&locale=en-gb&category=GPU&gpu=RTX 3080'
    })

    expect(source).toBeInstanceOf(Nvidia)
  })
})
