import 'reflect-metadata'

import { ClassWrapperService } from './class-wrapper.service'
import { ConfigService, IClassLoggerConfig } from './config.service'
import { CLASS_LOGGER_METADATA_KEY } from './constants'

describe(ClassWrapperService.name, () => {
  describe('isPromise', () => {
    test('returns true for native Promises', () => {
      const classWrapperService: any = new ClassWrapperService()
      const isPromise = classWrapperService.isPromise(Promise.resolve())
      expect(isPromise).toBe(true)
    })
    test('returns true for Promise-like objects', () => {
      const classWrapperService: any = new ClassWrapperService()
      const isPromise = classWrapperService.isPromise({ then: () => undefined, catch: () => undefined })
      expect(isPromise).toBe(true)
    })
    test('returns false for non-Promise-like objects', () => {
      const classWrapperService: any = new ClassWrapperService()
      const isPromise = classWrapperService.isPromise({})
      expect(isPromise).toBe(false)
    })
    test('returns false for null', () => {
      const classWrapperService: any = new ClassWrapperService()
      const isPromise = classWrapperService.isPromise(null)
      expect(isPromise).toBe(false)
    })
    test('returns false for non-objects', () => {
      const classWrapperService: any = new ClassWrapperService()
      const isPromise = classWrapperService.isPromise('invalid')
      expect(isPromise).toBe(false)
    })
  })

  describe('classGetConfigMerged', () => {
    test('returns a merged config', () => {
      class Test {}
      const meta: IClassLoggerConfig = {
        include: {
          args: false,
          classInstance: false,
          construct: false,
          result: false,
        },
      }
      Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, meta, Test.prototype)
      const classWrapperService: any = new ClassWrapperService()
      const spyConfigsMerge = jest.spyOn(ConfigService, 'configsMerge')
      const configRes = classWrapperService.classGetConfigMerged(Test.prototype)
      expect(configRes).toEqual({ ...ConfigService.config, ...meta })
      expect(spyConfigsMerge).toBeCalledTimes(1)
    })
  })

  describe('wrapFunction', () => {
    const logsSuccess = async (fn: jest.Mock, fnRes: any, ctx?: any) => {
      const config = ConfigService.config
      const className = 'Test'
      const propertyName = 'test'
      const classInstance = {}
      const argsTest = [Symbol(), Symbol()]

      const spyFormatterStart = jest.spyOn(config.formatter, 'start')
      const spyFormatterStartMockRes = 'spyFormatterStartMockRes'
      spyFormatterStart.mockImplementation(() => spyFormatterStartMockRes)

      const spyFormatterEnd = jest.spyOn(config.formatter, 'end')
      const spyFormatterEndMockRes = 'spyFormatterEndMockRes'
      spyFormatterEnd.mockImplementation(() => spyFormatterEndMockRes)

      const spyLog = jest.spyOn(config, 'log')
      const spyLogError = jest.spyOn(config, 'logError')

      const classWrapperService: any = new ClassWrapperService()
      const fnWrapped: (...args: any) => any = classWrapperService.wrapFunction(
        config,
        fn,
        className,
        propertyName,
        classInstance,
      )
      const fnWrappedRes = await fnWrapped.apply(ctx, argsTest)
      expect(fnWrappedRes).toBe(fnRes)
      expect(fn).toBeCalledTimes(1)
      expect(fn).toBeCalledWith(...argsTest)
      expect(spyFormatterStart).toBeCalledTimes(1)
      expect(spyFormatterStart).toBeCalledWith({
        args: argsTest,
        classInstance,
        className,
        include: config.include,
        propertyName,
      })
      expect(spyFormatterEnd).toBeCalledTimes(1)
      expect(spyFormatterEnd).toBeCalledWith({
        args: argsTest,
        classInstance,
        className,
        error: false,
        include: config.include,
        propertyName,
        result: fnRes,
      })
      expect(spyLog).toBeCalledTimes(2)
      expect(spyLog).toHaveBeenNthCalledWith(1, spyFormatterStartMockRes)
      expect(spyLog).toHaveBeenNthCalledWith(2, spyFormatterEndMockRes)
      expect(spyLogError).toBeCalledTimes(0)
    }

    const logError = async (fn: jest.Mock, error: Error) => {
      const config = ConfigService.config
      const className = 'Test'
      const propertyName = 'test'
      const classInstance = {}
      const argsTest = [Symbol(), Symbol()]

      const spyFormatterStart = jest.spyOn(config.formatter, 'start')
      const spyFormatterStartMockRes = 'spyFormatterStartMockRes'
      spyFormatterStart.mockImplementation(() => spyFormatterStartMockRes)

      const spyFormatterEnd = jest.spyOn(config.formatter, 'end')
      const spyFormatterEndMockRes = 'spyFormatterEndMockRes'
      spyFormatterEnd.mockImplementation(() => spyFormatterEndMockRes)

      const spyLog = jest.spyOn(config, 'log')
      const spyLogError = jest.spyOn(config, 'logError')

      const classWrapperService: any = new ClassWrapperService()
      const fnWrapped: (...args: any[]) => any = classWrapperService.wrapFunction(
        config,
        fn,
        className,
        propertyName,
        classInstance,
      )
      const fnWrappedPromise = (async () => fnWrapped(...argsTest))()
      await expect(fnWrappedPromise).rejects.toThrow(error)
      expect(fn).toBeCalledTimes(1)
      expect(fn).toBeCalledWith(...argsTest)
      expect(spyFormatterStart).toBeCalledTimes(1)
      expect(spyFormatterStart).toBeCalledWith({
        args: argsTest,
        classInstance,
        className,
        include: config.include,
        propertyName,
      })
      expect(spyFormatterEnd).toBeCalledTimes(1)
      expect(spyFormatterEnd).toBeCalledWith({
        args: argsTest,
        classInstance,
        className,
        error: true,
        include: config.include,
        propertyName,
        result: error,
      })
      expect(spyLog).toBeCalledTimes(1)
      expect(spyLog).toBeCalledWith(spyFormatterStartMockRes)
      expect(spyLogError).toBeCalledTimes(1)
      expect(spyLogError).toBeCalledWith(spyFormatterEndMockRes)
    }

    describe('synchronous target function', () => {
      test('logs success', async () => {
        const fnRes = Symbol()
        const fn = jest.fn(() => fnRes)
        await logsSuccess(fn, fnRes)
      })
      test('logs error', async () => {
        class ErrorTest extends Error {}
        const error = new ErrorTest()
        const fn = jest.fn(() => {
          throw error
        })
        await logError(fn, error)
      })
      test('preserves this context', async () => {
        const fnRes = Symbol()
        const ctx = {}
        // tslint:disable-next-line only-arrow-functions
        const fn = jest.fn(function(this: any) {
          expect(this).toBe(ctx)
          return fnRes
        })
        await logsSuccess(fn, fnRes, ctx)
      })
    })

    describe('asynchronous target function', () => {
      test('logs success', async () => {
        const fnRes = Symbol()
        const fn = jest.fn(async () => fnRes)
        await logsSuccess(fn, fnRes)
      })
      test('logs error', async () => {
        class ErrorTest extends Error {}
        const error = new ErrorTest()
        const fn = jest.fn(async () => {
          throw error
        })
        await logError(fn, error)
      })
    })
  })

  describe('wrapClassInstance', () => {
    test('returns non-function properties', () => {
      const propName = 'test'
      const propVal = Symbol()
      const instance = {
        [propName]: propVal,
      }

      const classWrapperService: any = new ClassWrapperService()
      const instanceWrapped = classWrapperService.wrapClassInstance(instance)

      const spyReflectGetMetadata = jest.spyOn(Reflect, 'getMetadata')
      const res = instanceWrapped[propName]
      expect(res).toBe(propVal)
      expect(spyReflectGetMetadata).toBeCalledTimes(0)
    })
    test('returns function properties without meta', () => {
      const propName = 'test'
      const propVal = () => Symbol()
      const instance = {
        [propName]: propVal,
      }

      const classWrapperService: any = new ClassWrapperService()
      const instanceWrapped = classWrapperService.wrapClassInstance(instance)

      const spyClassGetConfigMerged = jest.spyOn(ClassWrapperService.prototype as any, 'classGetConfigMerged')
      const spyReflectGetMetadata = jest.spyOn(Reflect, 'getMetadata')
      const res = instanceWrapped[propName]
      expect(res).toBe(propVal)
      expect(spyReflectGetMetadata).toBeCalledTimes(1)
      expect(spyClassGetConfigMerged).toBeCalledTimes(0)
    })
    test('returns wrapped function properties', () => {
      const propName = 'test'
      const propValRes = Symbol()
      const propVal = jest.fn(() => propValRes)
      const instance = {
        [propName]: propVal,
      }

      const classWrapperService: any = new ClassWrapperService()
      const instanceWrapped = classWrapperService.wrapClassInstance(instance)

      Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, {}, instance)
      Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, {}, instance, propName)

      const spyClassGetConfigMerged = jest.spyOn(ClassWrapperService.prototype as any, 'classGetConfigMerged')
      const spyConfigsMerge = jest.spyOn(ConfigService, 'configsMerge')
      const spyWrapFunction = jest.spyOn(ClassWrapperService.prototype as any, 'wrapFunction')
      const spyReflectGetMetadata = jest.spyOn(Reflect, 'getMetadata')
      const resFn = instanceWrapped[propName]
      expect(spyReflectGetMetadata).toBeCalledTimes(2)
      expect(spyClassGetConfigMerged).toBeCalledTimes(1)
      expect(spyConfigsMerge).toBeCalledTimes(2)
      expect(spyWrapFunction).toBeCalledTimes(1)
      const res = resFn()
      expect(res).toBe(propValRes)
      expect(propVal).toBeCalledTimes(1)
    })
  })

  describe('wrap', () => {
    test('wraps class and logs its construction', () => {
      const config: IClassLoggerConfig = {}

      class Test {}

      const classWrapperService = new ClassWrapperService()
      const TestWrapped = classWrapperService.wrap(Test)

      Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, Test.prototype)

      const spyFormatterServiceStart = jest.spyOn(ConfigService.config.formatter, 'start')
      const spyWrapClassInstance = jest.spyOn(classWrapperService as any, 'wrapClassInstance')
      expect(new TestWrapped()).toBeInstanceOf(Test)
      expect(spyFormatterServiceStart).toBeCalledTimes(1)
      expect(spyFormatterServiceStart).toBeCalledWith({
        args: [],
        className: Test.name,
        include: ConfigService.config.include,
        propertyName: 'construct',
      })
      expect(spyWrapClassInstance).toBeCalledTimes(1)
    })
    test("wraps class and doesn't log its construction", () => {
      const config: IClassLoggerConfig = {
        include: {
          construct: false,
        },
      }

      class Test {}

      const classWrapperService = new ClassWrapperService()
      const TestWrapped = classWrapperService.wrap(Test)

      Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, Test.prototype)

      const spyFormatterServiceStart = jest.spyOn(ConfigService.config.formatter, 'start')
      const spyWrapClassInstance = jest.spyOn(classWrapperService as any, 'wrapClassInstance')
      expect(new TestWrapped()).toBeInstanceOf(Test)
      expect(spyFormatterServiceStart).toBeCalledTimes(0)
      expect(spyWrapClassInstance).toBeCalledTimes(1)
    })
  })
})
