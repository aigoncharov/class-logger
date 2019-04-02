import { ClassWrapperService } from './class-wrapper.service'
import { IClassLoggerConfigPartial } from './config.service'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

const classWrapper = new ClassWrapperService()
export const LogClass = (config: IClassLoggerConfigPartial = {}) => (target: new (...args: any[]) => any) => {
  Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, target.prototype)
  return classWrapper.wrap(target)
}
