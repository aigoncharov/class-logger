import { ConfigService, IClassLoggerConfig, IClassLoggerConfigPartial } from './config.service'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

export class ClassWrapperService {
  public wrap(targetWrap: new (...args: any) => any) {
    const classWrapper = this
    return new Proxy(targetWrap, {
      construct(target, args, newTarget) {
        const config = classWrapper.classGetConfigMerged(target.prototype)
        if (config.include.construct) {
          const messageStart = config.formatter.start({
            args,
            className: target.name,
            include: config.include,
            propertyName: 'construct',
          })
          config.log(messageStart)
        }
        const instance = Reflect.construct(target, args, newTarget)
        const instanceWrapped = classWrapper.wrapClassInstance(instance)
        return instanceWrapped
      },
    })
  }

  protected wrapClassInstance(instance: object) {
    const classWrapper = this
    return new Proxy(instance, {
      get(target, property: string | symbol, receiver) {
        const prop = Reflect.get(target, property, receiver)
        if (typeof prop !== 'function') {
          return prop
        }
        const configProp = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, target, property)
        if (!configProp) {
          return prop
        }
        const configClass = classWrapper.classGetConfigMerged(target)
        const configFinal = ConfigService.configsMerge(configClass, configProp)
        const propWrapped = classWrapper.wrapFunction(configFinal, prop, instance.constructor.name, property, target)
        return propWrapped
      },
    })
  }

  protected wrapFunction<T extends (...args: any[]) => any>(
    config: IClassLoggerConfig,
    fn: T,
    className: string,
    propertyName: string | symbol,
    classInstance?: object,
  ): T {
    const classWrapper = this
    // Use non-arrow function to allow dynamic context
    // tslint:disable-next-line only-arrow-functions
    return function(...args: any[]) {
      const messageStart = config.formatter.start({
        args,
        classInstance,
        className,
        include: config.include,
        propertyName,
      })
      config.log(messageStart)

      const logEnd = (result: any, error?: boolean) => {
        const messageEnd = config.formatter.end({
          args,
          classInstance,
          className,
          error: !!error,
          include: config.include,
          propertyName,
          result,
        })
        let logFn = config.log
        if (error) {
          logFn = config.logError
        }
        logFn(messageEnd)
      }

      try {
        const res = fn(...args)
        if (classWrapper.isPromise(res)) {
          res
            .then((result: any) => {
              logEnd(result)
              return result
            })
            .catch((error: Error) => {
              logEnd(error, true)
              throw error
            })
          return res
        }
        logEnd(res)
        return res
      } catch (error) {
        logEnd(error, true)
        throw error
      }
    } as T
  }

  protected isPromise(val: any) {
    return typeof val === 'object' && typeof val.then === 'function' && typeof val.catch === 'function'
  }

  protected classGetConfigMerged(target: object) {
    const configClassMeta: IClassLoggerConfigPartial = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, target)
    const configRes = ConfigService.configsMerge(ConfigService.config, configClassMeta)
    return configRes
  }
}
