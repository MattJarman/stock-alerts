import chromium from 'chrome-aws-lambda'
import Source from '../../../src/sources/Source'

const gotoMock = jest.fn()
const selectorMock = jest.fn()
const setUserAgent = jest.fn()
const closeMock = jest.fn()
jest.mock('puppeteer', () => ({
  launch: browserMock
}))

const browserMock = jest.fn().mockImplementation(() => ({
  newPage: jest.fn().mockImplementation(() => ({
    goto: gotoMock,
    $: selectorMock,
    setUserAgent: setUserAgent
  })),
  close: closeMock
}))

const baseUrl = 'https://google.com'
class TestSource extends Source {
  readonly baseUrl = baseUrl
  readonly defaultSelector: string = '#selector'
  readonly defaultSelectorEvaluation: boolean = true
}

const evaluateDataProvider = [
  {
    selectorEvaluation: true,
    selectorReturn: {},
    expected: true
  },
  {
    selectorEvaluation: false,
    selectorReturn: {},
    expected: false
  },
  {
    selectorEvaluation: false,
    selectorReturn: null,
    expected: true
  },
  {
    selectorEvaluation: true,
    selectorReturn: null,
    expected: false
  }
]

describe('Test Source', () => {
  describe.each(evaluateDataProvider)('Evaluate', (scenario) => {
    it(`returns ${scenario.expected} if selector was ${scenario.selectorReturn ? 'found' : 'not found'} and selectorEvaluation is ${scenario.selectorEvaluation}`, async () => {
      const product = 'apple'
      const expectedProductUrl = `${baseUrl}/${product}`
      const source = new TestSource({
        productName: product,
        productUrl: product,
        selector: '#example',
        selectorEvaluation: scenario.selectorEvaluation
      })

      selectorMock.mockResolvedValue(scenario.selectorReturn)

      const result = await source.find()
      expect(gotoMock).toHaveBeenCalledWith(expectedProductUrl)
      expect(setUserAgent).toHaveBeenCalled()
      expect(result).toEqual({
        product: product,
        url: expectedProductUrl,
        source: 'TestSource',
        inStock: scenario.expected
      })
    })
  })

  describe('Browser', () => {
    it('closes the browser if browser is set', async () => {
      const product = 'apple'
      const source = new TestSource({
        productName: product,
        productUrl: product
      })

      await source.find()
      await source.close()

      expect(closeMock).toHaveBeenCalledTimes(1)
    })

    it('does not close the browser if the browser is not set', async () => {
      const product = 'apple'
      const source = new TestSource({
        productName: product,
        productUrl: product
      })

      await source.close()

      expect(closeMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('.setBrowserInstance()', () => {
    it('sets the browser instance', async () => {
      const source = new TestSource({
        productName: 'apple',
        productUrl: 'http://localhost'
      })

      const browser = await chromium.puppeteer.launch()

      // We're using the mock above, so we want to make sure the .launch() call is not counted below when
      // setting our expectations
      browserMock.mockReset()

      source.setBrowserInstance(browser)
      await source.find()

      expect(browser.newPage).toHaveBeenCalled()
      expect(browserMock).toHaveBeenCalledTimes(0)
    })
  })
})
