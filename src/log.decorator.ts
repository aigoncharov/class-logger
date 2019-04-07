import { IClassLoggerConfig } from './config.service'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

export const Log = (config: IClassLoggerConfig = {}) => (target: object, propertyKey: string | symbol) => {
  Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, target, propertyKey)
}
