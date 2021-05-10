import Amazon from '../../../src/sources/Amazon'

describe('Test Amazon', () => {
  it('creates a new instance of an Amazon source', () => {
    const source = new Amazon({
      productName: 'PS5',
      productUrl: 'PlayStation-9395003-5-Console/dp/B08H95Y452/ref=sr_1_3?dchild=1&keywords=ps5&qid=1620678341&sr=8-3'
    })

    expect(source).toBeInstanceOf(Amazon)
  })
})
