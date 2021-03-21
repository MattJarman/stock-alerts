import { SourceProps, SourceResult } from '../interfaces/sources/Source'
import Source from './Source'

export default class Smyths extends Source {
  readonly baseUrl = 'https://www.smythstoys.com/uk/en-gb/'
  readonly selector: string = '#addToCartButton'
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
    const inStock = await this.evaluate()

    return {
      product: this.productName,
      url: this.getUrl(),
      inStock: inStock
    }
  }
}
