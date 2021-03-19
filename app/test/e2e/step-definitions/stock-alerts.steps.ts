import * as assert from 'assert'
import { given, when, then, binding } from 'cucumber-tsflow'
import StockAlertRepository from '../../../src/repositories/StockAlertRepository'

@binding([StockAlertRepository])
export default class StockAlertsSteps {
  private lastSent: Date = new Date()
  private source = ''
  private product = ''

  // eslint-disable-next-line no-useless-constructor
  public constructor (protected repository: StockAlertRepository) {}

  @given(/a (.*) source for (.*) exists/)
  public async aProductSourceExists (product: string, source: string): Promise<void> {
    this.lastSent.setDate(this.lastSent.getDate() - 1)
    this.product = product
    this.source = source
    await this.repository.update(this.product, this.source, this.lastSent)
  }

  @when(/that source is updated/)
  public async aProductSourceIsUpdated (): Promise<void> {
    await this.repository.update(this.product, this.source, new Date())
  }

  @then(/the last_sent date is updated/)
  public async theLastSentDateIsUpdated (): Promise<void> {
    const result = await this.repository.get(this.product, this.source)
    assert.ok(result)
    assert.strictEqual(new Date(result.last_sent) > this.lastSent, true)
  }
}
