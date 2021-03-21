import { SourceProps, SourceResult } from '../interfaces/sources/Source'
import Source from './Source'

export default class Amazon extends Source {
  readonly baseUrl = 'https://www.amazon.co.uk'
  readonly selector: string = '#buy-now-button'
  readonly selectorEvaluation = true
  readonly productUrl: string
  private readonly productName: string

  public constructor (props: SourceProps) {
    super(props)
    this.productName = props.productName
    this.productUrl = props.productUrl

    if (props.selector) {
      this.selector = props.selector
    }

    if (props.selectorEvaluation) {
      this.selectorEvaluation = props.selectorEvaluation
    }
  }

  public async find (): Promise<SourceResult> {
    console.time(this.productName)
    const inStock = await this.evaluate()
    console.timeEnd(this.productName)

    return {
      product: this.productName,
      url: this.getUrl(),
      inStock: inStock
    }
  }
}
