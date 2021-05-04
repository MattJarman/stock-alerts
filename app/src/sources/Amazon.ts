import { SourceProps } from '../interfaces/sources/Source'
import Source from './Source'

export default class Amazon extends Source {
  readonly baseUrl = 'https://www.amazon.co.uk'
  readonly selector: string = '#buy-now-button'
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
