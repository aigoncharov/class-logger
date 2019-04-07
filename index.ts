export { CLASS_LOGGER_METADATA_KEY } from './src/constants'
import { ConfigService } from './src/config.service'
export { IClassLoggerConfig, IClassLoggerConfigComplete } from './src/config.service'
export {
  IClassLoggerIncludeConfig,
  IClassLoggerFormatterStartData,
  IClassLoggerFormatterEndData,
  IClassLoggerFormatter,
  ClassLoggerFormatterService,
} from './src/formatter.service'
export { LogClass } from './src/log-class.decorator'
export { Log } from './src/log.decorator'

export const setConfig = ConfigService.setConfig.bind(ConfigService)
