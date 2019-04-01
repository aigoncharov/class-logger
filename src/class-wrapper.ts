import { configDefault, configsMerge, IClassLoggerConfig, IClassLoggerConfigPartial } from './config'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

export const wrapClassConstructor = (targetWrap: new (...args: any) => any) =>
  new Proxy(targetWrap, {
    construct(target, args, newTarget) {
      const config = classGetConfigMerged(target.prototype)
      let construct = Reflect.construct.bind(Reflect)
      if (config.include.construct) {
        construct = wrapFunction(config, construct, target.name, 'construct')
      }
      const instance = construct(target, args, newTarget)
      const instanceWrapped = wrapClassInstance(instance)
      return instanceWrapped
    },
  })

export const wrapClassInstance = (instance: object) =>
  new Proxy(instance, {
    get(target, property: string | symbol, receiver) {
      const prop = Reflect.get(target, property, receiver)
      if (typeof prop !== 'function') {
        return prop
      }
      const configProp = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, target, property)
      if (!configProp) {
        return prop
      }
      const configClass = classGetConfigMerged(target)
      const configFinal = configsMerge(configClass, configProp)
      const propWrapped = wrapFunction(configFinal, prop, instance.constructor.name, property, target)
      return propWrapped
    },
  })

export const wrapFunction = <T extends (...args: any[]) => any>(
  config: IClassLoggerConfig,
  fn: T,
  className: string,
  propertyName: string | symbol,
  classInstance?: object,
): T =>
  // Use non-arrow function to allow dynamic context
  // tslint:disable-next-line only-arrow-functions
  function(...args: any[]) {
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
      config.logError(messageEnd)
    }

    try {
      const res = fn(...args)
      if (!isPromise(res)) {
        logEnd(res)
      }
      res.catch((error: Error) => {
        logEnd(error, true)
        throw error
      })
      return res
    } catch (error) {
      logEnd(error, true)
      throw error
    }
  } as T

export const isPromise = (val: any) =>
  typeof val === 'object' && typeof val.then === 'function' && typeof val.catch === 'function'

export const classGetConfigMerged = (target: object) => {
  const configClassMeta: IClassLoggerConfigPartial = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, target)
  const configRes = configsMerge(configDefault, configClassMeta)
  return configRes
}
