import { SourceProps } from '../interfaces/sources/Source'
import Source from './Source'

export default class Smyths extends Source {
  readonly baseUrl = 'https://www.smythstoys.com/uk/en-gb/'
  readonly selector: string = '#addToCartButton'
  readonly selectorEvaluation: boolean = true

  public constructor (props: SourceProps) {
    super(props)

    if (props.selector) {
      this.selector = props.selector
    }

    if (props.selectorEvaluation) {
      this.selectorEvaluation = props.selectorEvaluation
    }
  }
}
