import 'reflect-metadata'

import { ClassWrapperService } from './class-wrapper.service'
import { IClassLoggerConfigPartial } from './config.service'
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
  test(`calls ${ClassWrapperService.name}.${ClassWrapperService.prototype.wrap.name}`, () => {
    const spyWrap = jest.spyOn(ClassWrapperService.prototype, 'wrap')
    class Test {}
    LogClass()(Test)
    const configExpected = Reflect.getMetadata(CLASS_LOGGER_METADATA_KEY, Test.prototype)
    expect(configExpected).toEqual({})
    expect(spyWrap).toBeCalledTimes(1)
    expect(spyWrap).toBeCalledWith(Test)
  })
})
