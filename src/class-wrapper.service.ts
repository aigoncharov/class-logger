import { ConfigService, IClassLoggerConfig, IClassLoggerConfigComplete } from './config.service'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

export class ClassWrapperService {
  public wrap<T extends new (...args: any) => any>(targetWrap: T) {
    const get = this.makeProxyTrapGet(targetWrap.name)
    return new Proxy(targetWrap, {
      construct: this.proxyTrapConstruct,
      // We need get trap for static properties and methods
      get,
    })
  }

  protected wrapClassInstance(instance: object) {
    const get = this.makeProxyTrapGet(instance.constructor.name)
    return new Proxy(instance, {
      get,
    })
  }

  protected wrapFunction<T extends (...args: any[]) => any>(
    config: IClassLoggerConfigComplete,
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
    const configClassMeta: IClassLoggerConfig = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, target)
    const configRes = ConfigService.configsMerge(ConfigService.config, configClassMeta)
    return configRes
  }

  protected proxyTrapConstruct = <T extends new (...args: any) => any>(target: T, args: any, newTarget: any) => {
    const config = this.classGetConfigMerged(target.prototype)
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
    const instanceWrapped = this.wrapClassInstance(instance)
    return instanceWrapped
  }
  protected makeProxyTrapGet = (className: string) => (target: object, property: string | symbol, receiver: any) => {
    const prop = Reflect.get(target, property, receiver)
    if (typeof prop !== 'function') {
      return prop
    }
    const configProp = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, target, property)
    if (!configProp) {
      return prop
    }
    const configClass = this.classGetConfigMerged(target)
    const configFinal = ConfigService.configsMerge(configClass, configProp)
    const propWrapped = this.wrapFunction(configFinal, prop, className, property, target)
    return propWrapped
  }
}
