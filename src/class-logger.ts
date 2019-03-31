export const wrapClassConstructor = (targetWrap: new (...args: any) => object) =>
  new Proxy(targetWrap, {
    construct(target, args, newTarget) {
      const instance = Reflect.construct(target, args, newTarget)
      const instanceWrapped = wrapClassInstance(instance)
      return instanceWrapped
    },
  })

export const wrapClassInstance = (instance: object) =>
  new Proxy(instance, {
    get(target, property, receiver) {
      const prop = Reflect.get(target, property, receiver)
      if (typeof prop !== 'function') {
        return prop
      }
      const propWrapped = wrapFunction(prop)
      return propWrapped
    },
  })

export const wrapFunction = <T extends (...args: any[]) => any>(fn: T): T => {}
