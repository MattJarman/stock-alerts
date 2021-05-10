import Source from './Source'

export default class Smyths extends Source {
  readonly baseUrl = 'https://www.smythstoys.com/uk/en-gb/'
  readonly defaultSelector: string = '#addToCartButton'
  readonly defaultSelectorEvaluation: boolean = true
}
