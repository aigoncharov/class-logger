import {
  ClassLoggerFormatterUniversal,
  formatDefault,
  IClassLoggerFormatterComplex,
  IClassLoggerMessageConfig,
} from './format'

type ClassLoggerFormatterLogger = (message: string) => void
export interface IClassLoggerConfig extends IClassLoggerMessageConfig {
  log: ClassLoggerFormatterLogger
  logError?: ClassLoggerFormatterLogger
  format: ClassLoggerFormatterUniversal | IClassLoggerFormatterComplex
}

export let configDefault: IClassLoggerConfig = {
  format: formatDefault,
  log: console.log, // tslint:disable-line no-console
  logError: console.error, // tslint:disable-line no-console
  message: {
    args: true,
  },
}
export const setConfigDefault = (config: IClassLoggerConfig) => {
  configDefault = config
}
