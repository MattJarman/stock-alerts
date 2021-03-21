import { Browser } from 'puppeteer-core'
import chromium from 'chrome-aws-lambda'
import { SourceProps, Source as SourceInterface, SourceResult } from '../interfaces/sources/Source'

export default abstract class Source implements SourceInterface {
  abstract baseUrl: string
  abstract productUrl: string
  abstract selector: string
  abstract selectorEvaluation: boolean
  protected readonly props: SourceProps
  protected browser: Browser | false = false

  protected constructor (props: SourceProps) {
    this.props = props
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

  abstract find(): Promise<SourceResult>
}
