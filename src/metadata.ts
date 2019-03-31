import { IClassLoggerConfigPartial } from './config'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

export const methodAddMeta = (config: IClassLoggerConfigPartial = {}): MethodDecorator => (target, propertyKey) => {
  Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, target, propertyKey)
}

export const classAddMeta = (config: IClassLoggerConfigPartial = {}): ClassDecorator => (target) => {
  Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, target)
}
