import chromium from 'chrome-aws-lambda'
import config from 'config'
import Logger from './helpers/Logger'
import StockAlertsHelper from './helpers/StockAlertsHelper'
import StockAlertsSender from './helpers/StockAlertsSender'
import StockAlertRepository from './repositories/StockAlertRepository'
import Source from './sources/Source'

export const router = (sources: Source[]) => {
  return async (): Promise<boolean> => {
    const logger = new Logger()

    logger.debug('Creating new browser instance.')
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    })

    logger.debug(`Finished creating new browser instance. Setting browser instance for ${sources.length} source(s).`)
    sources.forEach(source => source.setBrowserInstance(browser))
    logger.debug('Finished setting browser instance for source(s).')

    logger.debug('Checking sources for products in stock.')
    const promises = sources.map(source => source.find())
    const results = await Promise.all(promises).finally(async () => await browser.close())
    logger.debug(`Done checking for products in stock.\r\nResults: ${JSON.stringify(results)}`)

    const inStockProducts = results.filter(result => result.inStock)
    if (inStockProducts.length === 0) {
      logger.info('No products found in stock.')
      return false
    }

    logger.info(`Found products in stock!\r\nProducts:${JSON.stringify(inStockProducts)}`)

    logger.debug('Retrieving alerts from the database.')
    const repository = new StockAlertRepository()
    const alerts = await repository.batchGet(inStockProducts.map(result => {
      return { product: result.product, source: result.source }
    }))
    logger.debug(`Done retrieving alerts from the database.\r\nAlerts${JSON.stringify(alerts)}`)

    logger.debug('Determining alerts to be sent.')
    const periodInMinutes: number = config.get('alerts.periodInMinutes')
    const toSend = StockAlertsHelper.getAlertsToSend(inStockProducts, alerts, periodInMinutes)
    logger.debug(`Done determining alerts to sent.\r\nAlerts${JSON.stringify(toSend)}`)

    logger.debug('Sending alerts.')
    const sender = new StockAlertsSender()
    const sent = await sender.send(toSend)

    if (!sent) {
      logger.warn('Alerts were not sent - Not updating database.')
      return true
    }

    logger.debug('Alerts were sent successfully, updating the database.')
    await Promise.all(toSend.map(result => repository.update(result.product, result.source)))
    logger.debug('Finished updating the database.')

    return true
  }
}
