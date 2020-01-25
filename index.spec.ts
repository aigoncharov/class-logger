import 'reflect-metadata'

import { Log, LogClass, setConfig } from './index'

describe('index', () => {
  setConfig({
    include: {
      classInstance: true,
    },
  })

  const successRes = 'syncSuccessResTest'
  const stackMock = 'stackTest'
  const codeMock = 'codeTest'
  class TestError extends Error {
    public code = codeMock
    public stack = stackMock
    constructor() {
      super('messageTest')
    }
  }
  @LogClass({
    log: (message) => console.info(message), // tslint:disable-line no-console
  })
  class Test {
    @Log()
    public static staticSuccess(arg1: string, arg2: string) {
      return successRes
    }
    @Log()
    public static staticError(arg1: string, arg2: string) {
      throw new TestError()
    }

    public prop1 = 123

    @Log()
    public propSyncSuccess = () => successRes
    @Log()
    public propSyncError = () => {
      throw new TestError()
    }

    @Log({
      log: (message) => console.debug(message), // tslint:disable-line no-console
    })
    public syncSuccess() {
      return successRes
    }
    @Log({
      log: (message) => console.debug(message), // tslint:disable-line no-console
    })
    public syncError() {
      throw new TestError()
    }
    @Log({
      logError: (message) => console.debug(message), // tslint:disable-line no-console
    })
    public async asyncSuccess(arg1: symbol) {
      return successRes
    }
    @Log({
      logError: (message) => console.debug(message), // tslint:disable-line no-console
    })
    public async asyncError(arg1: symbol) {
      throw new TestError()
    }
  }

  test('staticSuccess', () => {
    const spyConsoleInfo = jest.spyOn(console, 'info')
    const spyConsoleError = jest.spyOn(console, 'error')
    const res = Test.staticSuccess('test1', 'test2')
    expect(res).toBe(successRes)
    expect(spyConsoleError).toBeCalledTimes(0)
    expect(spyConsoleInfo).toBeCalledTimes(2)
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(1, 'Test.staticSuccess. Args: [test1, test2]. Class instance: N/A.')
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(
      2,
      'Test.staticSuccess -> done. Args: [test1, test2]. Class instance: N/A. Res: syncSuccessResTest.',
    )
  })
  test('staticError', () => {
    const spyConsoleInfo = jest.spyOn(console, 'info')
    const spyConsoleError = jest.spyOn(console, 'error')
    expect(() => Test.staticError('test1', 'test2')).toThrow(TestError)
    expect(spyConsoleError).toBeCalledTimes(1)
    expect(spyConsoleInfo).toBeCalledTimes(1)
    expect(spyConsoleInfo).toBeCalledWith('Test.staticError. Args: [test1, test2]. Class instance: N/A.')
    expect(spyConsoleError).toBeCalledWith(
      'Test.staticError -> error. Args: [test1, test2]. Class instance: N/A. Res: {"className":"TestError","code":"codeTest","message":"messageTest","name":"Error","stack":"stackTest"}.',
    )
  })
  test('propSyncSuccess', () => {
    const spyConsoleInfo = jest.spyOn(console, 'info')
    const spyConsoleError = jest.spyOn(console, 'error')
    const res = new Test().propSyncSuccess()
    expect(res).toBe(successRes)
    expect(spyConsoleError).toBeCalledTimes(0)
    expect(spyConsoleInfo).toBeCalledTimes(3)
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(1, 'Test.construct. Args: []. Class instance: N/A.')
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(
      2,
      'Test.propSyncSuccess. Args: []. Class instance: Test {"prop1":123}.',
    )
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(
      3,
      'Test.propSyncSuccess -> done. Args: []. Class instance: Test {"prop1":123}. Res: syncSuccessResTest.',
    )
  })
  test('propSyncError', () => {
    const spyConsoleInfo = jest.spyOn(console, 'info')
    const spyConsoleError = jest.spyOn(console, 'error')
    expect(() => new Test().propSyncError()).toThrow(TestError)
    expect(spyConsoleError).toBeCalledTimes(1)
    expect(spyConsoleInfo).toBeCalledTimes(2)
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(1, 'Test.construct. Args: []. Class instance: N/A.')
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(
      2,
      'Test.propSyncError. Args: []. Class instance: Test {"prop1":123}.',
    )
    expect(spyConsoleError).toBeCalledWith(
      'Test.propSyncError -> error. Args: []. Class instance: Test {"prop1":123}. Res: {"className":"TestError","code":"codeTest","message":"messageTest","name":"Error","stack":"stackTest"}.',
    )
  })
  test('syncSuccess', () => {
    const spyConsoleInfo = jest.spyOn(console, 'info')
    const spyConsoleDebug = jest.spyOn(console, 'debug')
    const spyConsoleError = jest.spyOn(console, 'error')
    const res = new Test().syncSuccess()
    expect(res).toBe(successRes)
    expect(spyConsoleError).toBeCalledTimes(0)
    expect(spyConsoleInfo).toBeCalledTimes(1)
    expect(spyConsoleDebug).toBeCalledTimes(2)
    expect(spyConsoleInfo).toBeCalledWith('Test.construct. Args: []. Class instance: N/A.')
    expect(spyConsoleDebug).toHaveBeenNthCalledWith(
      1,
      'Test.syncSuccess. Args: []. Class instance: Test {"prop1":123}.',
    )
    expect(spyConsoleDebug).toHaveBeenNthCalledWith(
      2,
      'Test.syncSuccess -> done. Args: []. Class instance: Test {"prop1":123}. Res: syncSuccessResTest.',
    )
  })
  test('syncError', () => {
    const spyConsoleInfo = jest.spyOn(console, 'info')
    const spyConsoleDebug = jest.spyOn(console, 'debug')
    const spyConsoleError = jest.spyOn(console, 'error')
    expect(() => new Test().syncError()).toThrow(TestError)
    expect(spyConsoleError).toBeCalledTimes(1)
    expect(spyConsoleInfo).toBeCalledTimes(1)
    expect(spyConsoleDebug).toBeCalledTimes(1)
    expect(spyConsoleInfo).toBeCalledWith('Test.construct. Args: []. Class instance: N/A.')
    expect(spyConsoleDebug).toBeCalledWith('Test.syncError. Args: []. Class instance: Test {"prop1":123}.')
    expect(spyConsoleError).toBeCalledWith(
      'Test.syncError -> error. Args: []. Class instance: Test {"prop1":123}. Res: {"className":"TestError","code":"codeTest","message":"messageTest","name":"Error","stack":"stackTest"}.',
    )
  })
  test('asyncSuccess', async () => {
    const spyConsoleInfo = jest.spyOn(console, 'info')
    const spyConsoleDebug = jest.spyOn(console, 'debug')
    const spyConsoleError = jest.spyOn(console, 'error')
    const res = await new Test().asyncSuccess(Symbol())
    expect(res).toBe(successRes)
    expect(spyConsoleError).toBeCalledTimes(0)
    expect(spyConsoleInfo).toBeCalledTimes(3)
    expect(spyConsoleDebug).toBeCalledTimes(0)
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(1, 'Test.construct. Args: []. Class instance: N/A.')
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(
      2,
      'Test.asyncSuccess. Args: [Symbol()]. Class instance: Test {"prop1":123}.',
    )
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(
      3,
      'Test.asyncSuccess -> done. Args: [Symbol()]. Class instance: Test {"prop1":123}. Res: syncSuccessResTest.',
    )
  })
  test('asyncError', async () => {
    const spyConsoleInfo = jest.spyOn(console, 'info')
    const spyConsoleDebug = jest.spyOn(console, 'debug')
    const spyConsoleError = jest.spyOn(console, 'error')
    await expect(new Test().asyncError(Symbol())).rejects.toThrow(TestError)
    expect(spyConsoleError).toBeCalledTimes(0)
    expect(spyConsoleInfo).toBeCalledTimes(2)
    expect(spyConsoleDebug).toBeCalledTimes(1)
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(1, 'Test.construct. Args: []. Class instance: N/A.')
    expect(spyConsoleInfo).toHaveBeenNthCalledWith(
      2,
      'Test.asyncError. Args: [Symbol()]. Class instance: Test {"prop1":123}.',
    )
    expect(spyConsoleDebug).toBeCalledWith(
      'Test.asyncError -> error. Args: [Symbol()]. Class instance: Test {"prop1":123}. Res: {"className":"TestError","code":"codeTest","message":"messageTest","name":"Error","stack":"stackTest"}.',
    )
  })

  test('keeps third-party metadata', () => {
    class TestMeta {
      @Log()
      public static static1() {} // tslint:disable-line no-empty

      @Log()
      public method1() {} // tslint:disable-line no-empty
    }

    const keyClass = Symbol()
    Reflect.defineMetadata(keyClass, 42, TestMeta)

    const keyPrototype = Symbol()
    Reflect.defineMetadata(keyPrototype, 43, TestMeta.prototype)

    const keyProp = Symbol()
    Reflect.defineMetadata(keyProp, 44, TestMeta.prototype, 'method1')

    const keyStatic = Symbol()
    Reflect.defineMetadata(keyStatic, 45, TestMeta, 'static1')

    const TestMetaWrapped = LogClass()(TestMeta)

    expect(Reflect.getMetadata(keyClass, TestMeta)).toBe(42)
    expect(Reflect.getMetadata(keyStatic, TestMeta, 'static1')).toBe(45)

    const instance = new TestMetaWrapped()
    expect(Reflect.getMetadata(keyPrototype, instance)).toBe(43)
    expect(Reflect.getMetadata(keyProp, instance, 'method1')).toBe(44)
  })
})
