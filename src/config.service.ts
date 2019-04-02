import { ClassLoggerFormatterService, IClassLoggerFormatter, IClassLoggerIncludeConfig } from './formatter.service'

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

export class ConfigService {
  public static config: IClassLoggerConfig = {
    formatter: new ClassLoggerFormatterService(),
    include: {
      args: true,
      construct: true,
      result: true,
    },
    log: console.log, // tslint:disable-line no-console
    logError: console.error, // tslint:disable-line no-console
  }
  public static configsMerge(config: IClassLoggerConfig, ...configsPartial: IClassLoggerConfigPartial[]) {
    return configsPartial.reduce<IClassLoggerConfig>(
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
  }

  public static setConfig(config: IClassLoggerConfigPartial) {
    this.config = this.configsMerge(this.config, config)
  }
}
