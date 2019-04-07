import 'reflect-metadata'

import { IClassLoggerConfig } from './config.service'
import { CLASS_LOGGER_METADATA_KEY } from './constants'
import { Log } from './log.decorator'

describe('@Log', () => {
  test('adds meta for class methods and properties', () => {
    const configMethod: IClassLoggerConfig = {
      include: {
        args: false,
      },
    }
    const methodName = 'method'
    const propertyName = 'property'
    const staticMethodName = 'staticMethod'
    const staticPropertyName = 'staticProperty'
    class Test {
      @Log(configMethod)
      public static [staticMethodName]() {
        return null
      }
      @Log()
      public static [staticPropertyName] = () => null
      @Log(configMethod)
      public [methodName]() {
        return null
      }
      @Log()
      public [propertyName] = () => null
    }
    const configStaticMethodExpected = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, Test, staticMethodName)
    expect(configStaticMethodExpected).toBe(configMethod)
    const configStaticPropertyExpected = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, Test, staticPropertyName)
    expect(configStaticPropertyExpected).toEqual({})
    const configMethodExpected = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, Test.prototype, methodName)
    expect(configMethodExpected).toBe(configMethod)
    const configPropertyExpected = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, Test.prototype, propertyName)
    expect(configPropertyExpected).toEqual({})
  })
})
