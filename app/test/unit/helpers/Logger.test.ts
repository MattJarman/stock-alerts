import Logger from '../../../src/helpers/Logger'

const logLevels = [
  'ERROR',
  'WARNING',
  'LOG',
  'INFO',
  'DEBUG'
]

console.error = jest.fn()
console.warn = jest.fn()
console.log = jest.fn()
console.info = jest.fn()
console.debug = jest.fn()

const message = 'test message'
describe('Test Logger', () => {
  it('defaults to WARNING if no level set in env', () => {
    process.env.LOG_LEVEL = ''

    const logger = new Logger()

    logger.warn(message)
    logger.log(message)

    expect(console.warn).toBeCalledTimes(1)
    expect(console.log).toBeCalledTimes(0)
  })

  describe.each(logLevels)('It always logs an error', (level) => {
    it(`logs error if the log level is ${level}`, () => {
      process.env.LOG_LEVEL = level

      new Logger().error(message)
      expect(console.error).toHaveBeenCalledWith(message)
    })
  })

  describe('.warn()', () => {
    it('logs warn if log level is greater than or equal to WARNING', () => {
      process.env.LOG_LEVEL = 'WARNING'

      new Logger().warn(message)
      expect(console.warn).toHaveBeenCalledWith(message)
    })

    it('does not log warn if log level is less than WARNING', () => {
      process.env.LOG_LEVEL = 'ERROR'

      new Logger().warn(message)
      expect(console.warn).toHaveBeenCalledTimes(0)
    })
  })

  describe('.log()', () => {
    it('logs log if log level is greater than or equal to LOG', () => {
      process.env.LOG_LEVEL = 'LOG'

      new Logger().log(message)
      expect(console.log).toHaveBeenCalledWith(message)
    })

    it('does not log log if log level is less than LOG', () => {
      process.env.LOG_LEVEL = 'WARNING'

      new Logger().log(message)
      expect(console.log).toHaveBeenCalledTimes(0)
    })
  })

  describe('.info()', () => {
    it('logs info if log level is greater than or equal to INFO', () => {
      process.env.LOG_LEVEL = 'INFO'

      new Logger().info(message)
      expect(console.info).toHaveBeenCalledWith(message)
    })

    it('does not log info if log level is less than INFO', () => {
      process.env.LOG_LEVEL = 'LOG'

      new Logger().info(message)
      expect(console.info).toHaveBeenCalledTimes(0)
    })
  })

  describe('.debug()', () => {
    it('logs debug if log level is greater than or equal to DEBUG', () => {
      process.env.LOG_LEVEL = 'DEBUG'

      new Logger().debug(message)
      expect(console.debug).toHaveBeenCalledWith(message)
    })

    it('does not log debug if log level is less than DEBUG', () => {
      process.env.LOG_LEVEL = 'INFo'

      new Logger().debug(message)
      expect(console.debug).toHaveBeenCalledTimes(0)
    })
  })
})
