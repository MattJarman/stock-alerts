import { Browser } from 'puppeteer-core'
import chromium from 'chrome-aws-lambda'
import { SourceProps, Source as SourceInterface, SourceResult } from '../interfaces/sources/Source'

export default abstract class Source implements SourceInterface {
  abstract baseUrl: string
  abstract selector: string
  abstract selectorEvaluation: boolean
  protected readonly props: SourceProps
  protected readonly productUrl: string
  protected readonly productName: string
  protected browser: Browser | false = false

  protected constructor (props: SourceProps) {
    this.props = props
    this.productUrl = props.productUrl
    this.productName = props.productName
  }

  protected async launch (): Promise<Browser> {
    return chromium.puppeteer.launch({
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    })
  }

  protected async evaluate (): Promise<boolean> {
    this.browser = await this.launch()
    const page = await this.browser.newPage()
    await page.goto(this.getUrl())
    return (await page.$(this.selector) !== null) === this.selectorEvaluation
  }

  protected async close (): Promise<void> {
    if (this.browser) {
      await this.browser.close()
    }
  }

  protected getUrl (): string {
    return `${this.baseUrl}/${this.productUrl}`
  }

  public async find (): Promise<SourceResult> {
    const inStock = await this.evaluate()
    await this.close()

    return {
      product: this.productName,
      url: this.getUrl(),
      inStock: inStock
    }
  }
}
