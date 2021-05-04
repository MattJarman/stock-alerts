export interface SourceProps {
  productName: string
  productUrl: string
  selector?: string
  selectorEvaluation?: boolean
}

export interface SourceResult {
  product: string
  inStock: boolean
  url: string
}

export interface Source {
  baseUrl: string
  selector: string
  selectorEvaluation: boolean
}
