import { IClassLoggerConfigPartial } from './config.service'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

export const Log = (config: IClassLoggerConfigPartial = {}) => (target: object, propertyKey: string | symbol) => {
  Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, target, propertyKey)
}
