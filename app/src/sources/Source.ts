import { Browser } from 'puppeteer-core'
import chromium from 'chrome-aws-lambda'
import { SourceProps, Source as SourceInterface, SourceResult } from '../interfaces/sources/Source'

export default abstract class Source implements SourceInterface {
  abstract baseUrl: string
  abstract defaultSelector: string
  abstract defaultSelectorEvaluation: boolean
  protected readonly props: SourceProps
  protected readonly productUrl: string
  protected readonly productName: string
  protected readonly selector?: string
  protected readonly selectorEvaluation?: boolean
  protected browser: Browser | false = false

  public constructor (props: SourceProps) {
    this.props = props
    this.productUrl = props.productUrl
    this.productName = props.productName
    this.selector = props.selector
    this.selectorEvaluation = props.selectorEvaluation
  }

  public async find (): Promise<SourceResult> {
    const inStock = await this.evaluate()

    return {
      product: this.productName,
      url: this.getUrl(),
      source: this.constructor.name,
      inStock: inStock
    }
  }

  public setBrowserInstance (browser: Browser): void {
    this.browser = browser
  }

  public async close (): Promise<void> {
    if (this.browser) {
      await this.browser.close()
    }
  }

  protected async launch (): Promise<Browser> {
    return chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    })
  }

  protected async evaluate (): Promise<boolean> {
    if (!this.browser) {
      this.browser = await this.launch()
    }

    const page = await this.browser.newPage()
    await page.goto(this.getUrl())
    return (await page.$(this.getSelector()) !== null) === this.getSelectorEvaluation()
  }

  protected getUrl (): string {
    return `${this.baseUrl}/${this.productUrl}`
  }

  protected getSelector (): string {
    return this.selector ?? this.defaultSelector
  }

  protected getSelectorEvaluation (): boolean {
    return this.selectorEvaluation ?? this.defaultSelectorEvaluation
  }
}
