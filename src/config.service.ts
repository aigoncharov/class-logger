import { ClassLoggerFormatterService, IClassLoggerFormatter, IClassLoggerIncludeConfig } from './formatter.service'

type ClassLoggerFormatterLogger = (message: string) => void
export interface IClassLoggerConfigComplete {
  log: ClassLoggerFormatterLogger
  logError: ClassLoggerFormatterLogger
  formatter: IClassLoggerFormatter
  include: IClassLoggerIncludeConfig
}
export interface IClassLoggerConfig {
  log?: ClassLoggerFormatterLogger
  logError?: ClassLoggerFormatterLogger
  formatter?: IClassLoggerFormatter
  include?: Partial<IClassLoggerIncludeConfig>
}

export class ConfigService {
  public static config: IClassLoggerConfigComplete = {
    formatter: new ClassLoggerFormatterService(),
    include: {
      args: true,
      classInstance: false,
      construct: true,
      result: true,
    },
    log: (message) => console.log(message), // tslint:disable-line no-console
    logError: (message) => console.error(message), // tslint:disable-line no-console
  }

  public static configsMerge(config: IClassLoggerConfigComplete, ...configsPartial: IClassLoggerConfig[]) {
    return configsPartial.reduce<IClassLoggerConfigComplete>(
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

  public static setConfig(config: IClassLoggerConfig) {
    this.config = this.configsMerge(this.config, config)
  }
}
