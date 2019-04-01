import 'reflect-metadata'

import { IClassLoggerConfigPartial } from './config'
import { CLASS_LOGGER_METADATA_KEY } from './constants'
import { LogClass } from './log-class.decorator'

describe('@LogClass', () => {
  test('adds meta for class constructor', () => {
    const config: IClassLoggerConfigPartial = {
      include: {
        args: false,
      },
    }
    @LogClass(config)
    class Test {}
    const configExpected = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, Test.prototype)
    expect(configExpected).toBe(config)
  })
})
