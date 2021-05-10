import Source from './Source'

export default class Nvidia extends Source {
  readonly baseUrl = 'https://shop.nvidia.com/en-gb'
  readonly defaultSelector: string = '.stock-grey-out'
  readonly defaultSelectorEvaluation: boolean = false
}
