import { ClassLoggerFormatterDefault, IClassLoggerFormatter, IClassLoggerIncludeConfig } from './formatter'

type ClassLoggerFormatterLogger = (message: string) => void
export interface IClassLoggerConfig {
  log: ClassLoggerFormatterLogger
  logError: ClassLoggerFormatterLogger
  formatter: IClassLoggerFormatter
  include: IClassLoggerIncludeConfig
}
export interface IClassLoggerConfigPartial {
  log?: ClassLoggerFormatterLogger
  logError?: ClassLoggerFormatterLogger
  formatter?: IClassLoggerFormatter
  include?: Partial<IClassLoggerIncludeConfig>
}

export const configsMerge = (config: IClassLoggerConfig, ...configsPartial: IClassLoggerConfigPartial[]) =>
  configsPartial.reduce<IClassLoggerConfig>(
    (configRes, configPartial) => ({
      ...configRes,
      ...configPartial,
      include: {
        ...configRes.include,
        ...configPartial.include,
      },
    }),
    config,
  )

export let configDefault: IClassLoggerConfig = {
  formatter: new ClassLoggerFormatterDefault(),
  include: {
    args: true,
    constructor: true,
    result: true,
  },
  log: console.log, // tslint:disable-line no-console
  logError: console.error, // tslint:disable-line no-console
}
export const setConfigDefault = (config: IClassLoggerConfigPartial) => {
  configDefault = configsMerge(configDefault, config)
}
