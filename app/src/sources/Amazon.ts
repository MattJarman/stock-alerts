import Source from './Source'

export default class Amazon extends Source {
  readonly baseUrl = 'https://www.amazon.co.uk'
  readonly defaultSelector: string = '#buy-now-button'
  readonly defaultSelectorEvaluation: boolean = true
}
