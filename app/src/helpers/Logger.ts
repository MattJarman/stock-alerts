const logLevelHierarchy: Record<string, number> = {
  ERROR: 0,
  WARNING: 1,
  LOG: 2,
  INFO: 3,
  DEBUG: 4
}

export default class Logger {
  private readonly logLevel: string = process.env.LOG_LEVEL || 'WARNING'

  public error (message: unknown): void {
    console.error(message)
  }

  public warn (message: unknown): void {
    if (logLevelHierarchy.WARNING <= logLevelHierarchy[this.logLevel]) {
      console.warn(message)
    }
  }

  public log (message: unknown): void {
    if (logLevelHierarchy.LOG <= logLevelHierarchy[this.logLevel]) {
      console.log(message)
    }
  }

  public info (message: unknown): void {
    if (logLevelHierarchy.INFO <= logLevelHierarchy[this.logLevel]) {
      console.info(message)
    }
  }

  public debug (message: unknown): void {
    if (logLevelHierarchy.DEBUG <= logLevelHierarchy[this.logLevel]) {
      console.debug(message)
    }
  }
}
