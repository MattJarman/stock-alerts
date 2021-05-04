import { SourceProps } from '../interfaces/sources/Source'
import Source from './Source'

export default class Nvidia extends Source {
  readonly baseUrl = 'https://shop.nvidia.com/en-gb'
  readonly selector: string = '.stock-grey-out'
  readonly selectorEvaluation: boolean = false

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
