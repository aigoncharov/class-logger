import 'reflect-metadata'

import { IClassLoggerConfigPartial } from './config.service'
import { CLASS_LOGGER_METADATA_KEY } from './constants'
import { Log } from './log.decorator'

describe('@Log', () => {
  test('adds meta for class methods and properties', () => {
    const configMethod: IClassLoggerConfigPartial = {
      include: {
        args: false,
      },
    }
    const methodName = 'method'
    const propertyName = 'property'
    class Test {
      @Log(configMethod)
      public [methodName]() {
        return null
      }
      @Log()
      public [propertyName] = () => null
    }
    const configMethodExpected = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, Test.prototype, methodName)
    expect(configMethodExpected).toBe(configMethod)
    const configPropertyExpected = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, Test.prototype, propertyName)
    expect(configPropertyExpected).toEqual({})
  })
})
