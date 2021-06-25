import Source from './Source'

export default class Nvidia extends Source {
  readonly baseUrl = 'https://shop.nvidia.com/en-gb'
  readonly defaultSelector: string = '.buy-link'
  readonly defaultSelectorEvaluation: boolean = true
}
