export interface StockAlert {
  product: string
  source: string
  'last_sent': string
}

export interface BatchGetProductInput {
  product: string
  source: string
}
