export interface StockAlert {
  product: string
  source: string
  'last_sent': string
}

export interface BatchGetStockAlertInput {
  product: string
  source: string
}
