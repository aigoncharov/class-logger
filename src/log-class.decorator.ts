import { wrapClassConstructor } from './class-wrapper'
import { IClassLoggerConfigPartial } from './config'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

export const LogClass = (config: IClassLoggerConfigPartial = {}) => (target: new (...args: any[]) => any) => {
  Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, target.prototype)
  return wrapClassConstructor(target)
}
