import { ClassWrapperService } from './class-wrapper.service'
import { IClassLoggerConfig } from './config.service'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

const classWrapper = new ClassWrapperService()
export const LogClass = (config: IClassLoggerConfig = {}) => <T extends new (...args: any[]) => any>(target: T) => {
  Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, target.prototype)
  Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, target)
  return classWrapper.wrap(target)
}
