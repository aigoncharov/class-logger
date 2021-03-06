import stringify from 'fast-safe-stringify'

import {
  ClassLoggerFormatterService,
  IClassLoggerFormatterEndData,
  IClassLoggerFormatterStartData,
} from './formatter.service'

describe(ClassLoggerFormatterService.name, () => {
  const classLoggerFormatterService = new ClassLoggerFormatterService()

  class TestService {}
  const valTestClassProp1 = 'prop1'
  const valTestClassProp2 = [Symbol(), 123]
  const valTestClassProp3 = {
    prop3: 'prop3',
  }
  class TestClass {
    public prop1 = valTestClassProp1
    public prop2 = valTestClassProp2
    public testService = new TestService()
    public propNull = null
    public prop3 = valTestClassProp3
    public propFn = () => null
  }
  const testClassStringExpected = stringify({
    prop1: valTestClassProp1,
    prop2: valTestClassProp2,
    testService: 'TestService {}',
    // tslint:disable-next-line object-literal-sort-keys
    propNull: 'null',
    prop3: valTestClassProp3,
  })
  const dataStart: IClassLoggerFormatterStartData = {
    args: ['test', Symbol(), { test: '123' }, undefined],
    classInstance: new TestClass(),
    className: 'ClassNameTest',
    include: {
      args: true,
      classInstance: false,
      construct: true,
      result: true,
    },
    propertyName: 'propertyNameTest',
  }
  const dataEnd: IClassLoggerFormatterEndData = {
    ...dataStart,
    error: false,
    result: 'resultTest',
  }

  describe('includeComplex', () => {
    test('returns true for boolean', () => {
      const res = (classLoggerFormatterService as any).includeComplex(true, 'start')
      expect(res).toBe(true)
    })
    test('returns false for boolean', () => {
      const res = (classLoggerFormatterService as any).includeComplex(false, 'start')
      expect(res).toBe(false)
    })
    test('returns true for start', () => {
      const res = (classLoggerFormatterService as any).includeComplex({ start: true, end: true }, 'start')
      expect(res).toBe(true)
    })
    test('returns false for start', () => {
      const res = (classLoggerFormatterService as any).includeComplex({ start: false, end: true }, 'start')
      expect(res).toBe(false)
    })
    test('returns true for end', () => {
      const res = (classLoggerFormatterService as any).includeComplex({ start: false, end: true }, 'end')
      expect(res).toBe(true)
    })
    test('returns false for end', () => {
      const res = (classLoggerFormatterService as any).includeComplex({ start: false, end: false }, 'end')
      expect(res).toBe(false)
    })
  })

  describe('base', () => {
    test('returns base', () => {
      const baseStr = (classLoggerFormatterService as any).base(dataStart)
      expect(baseStr).toBe(`${dataStart.className}.${dataStart.propertyName.toString()}`)
    })
  })
  describe('operation', () => {
    test('returns done', () => {
      const operationStr = (classLoggerFormatterService as any).operation(dataEnd)
      expect(operationStr).toBe(' -> done')
    })
    test('returns error', () => {
      const operationStr = (classLoggerFormatterService as any).operation({ ...dataEnd, error: true })
      expect(operationStr).toBe(' -> error')
    })
  })
  describe('args', () => {
    test('returns stringified args', () => {
      const argsStr = (classLoggerFormatterService as any).args(dataStart)
      expect(argsStr).toBe(
        `. Args: [${dataStart.args[0]}, ${dataStart.args[1].toString()}, ${stringify(dataStart.args[2])}, undefined]`,
      )
    })
  })
  describe('classInstance', () => {
    test('returns stringified classInstance', () => {
      const argsStr = (classLoggerFormatterService as any).classInstance(dataStart)
      expect(argsStr).toBe(`. Class instance: TestClass ${testClassStringExpected}`)
    })
    test('returns a placeholder', () => {
      const argsStr = (classLoggerFormatterService as any).classInstance({
        ...dataStart,
        classInstance: undefined,
      })
      expect(argsStr).toBe(`. Class instance: ${(classLoggerFormatterService as any).placeholderNotAvailable}`)
    })
  })
  describe('result', () => {
    test('returns non-object result', () => {
      const resStr = (classLoggerFormatterService as any).result(dataEnd)
      expect(resStr).toBe(`. Res: ${dataEnd.result}`)
    })
    test('returns undefined', () => {
      const resStr = (classLoggerFormatterService as any).result({
        ...dataEnd,
        result: undefined,
      })
      expect(resStr).toBe(`. Res: undefined`)
    })
    test('returns stringified object result', () => {
      const resultObj = {
        test: 42,
      }
      const resStr = (classLoggerFormatterService as any).result({
        ...dataEnd,
        result: resultObj,
      })
      expect(resStr).toBe(`. Res: ${stringify(resultObj)}`)
    })
    test('returns stringified array result', () => {
      const resultArr = [
        {
          test: 42,
        },
        34,
      ]
      const resStr = (classLoggerFormatterService as any).result({
        ...dataEnd,
        result: resultArr,
      })
      expect(resStr).toBe(`. Res: [${stringify(resultArr[0])}, ${resultArr[1]}]`)
    })
    test('returns a serialized error result', () => {
      class TestError extends Error {
        public code = 101
      }
      const result = new TestError()
      result.stack = 'test'
      const resStr = (classLoggerFormatterService as any).result({
        ...dataEnd,
        result,
      })
      expect(resStr).toBe(`. Res: TestError ${stringify({ code: 101, message: '', name: 'Error', stack: 'test' })}`)
    })
    test('returns serialized complex object result', () => {
      class A {
        // @ts-ignore
        private test = 42
      }
      const resultObj = new A()
      const resStr = (classLoggerFormatterService as any).result({
        ...dataEnd,
        result: resultObj,
      })
      expect(resStr).toBe(`. Res: A ${stringify({ test: 42 })}`)
    })
    test('returns serialized complex built-in object result', () => {
      const resultObj = new Map([['test', 42]])
      const resStr = (classLoggerFormatterService as any).result({
        ...dataEnd,
        result: resultObj,
      })
      expect(resStr).toBe(`. Res: Map {}`)
    })
  })

  describe(ClassLoggerFormatterService.prototype.start.name, () => {
    let spyBase: jest.MockInstance<any, any[]>
    let spyArgs: jest.MockInstance<any, any[]>
    let spyClassInstance: jest.MockInstance<any, any[]>
    let spyFinal: jest.MockInstance<any, any[]>
    beforeEach(() => {
      spyBase = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'base')
      spyArgs = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'args')
      spyClassInstance = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'classInstance')
      spyFinal = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'final')
    })

    test('includes: args, no class instance', () => {
      const message = classLoggerFormatterService.start(dataStart)
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(1)
      expect(spyClassInstance).toBeCalledTimes(0)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: args (complex), no class instance', () => {
      const message = classLoggerFormatterService.start({
        ...dataStart,
        include: {
          ...dataStart.include,
          args: {
            end: false,
            start: true,
          },
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(1)
      expect(spyClassInstance).toBeCalledTimes(0)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: args, class instance', () => {
      const message = classLoggerFormatterService.start({
        ...dataStart,
        include: {
          ...dataStart.include,
          classInstance: true,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(1)
      expect(spyClassInstance).toBeCalledTimes(1)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: no args, class instance', () => {
      const message = classLoggerFormatterService.start({
        ...dataStart,
        include: {
          ...dataStart.include,
          args: false,
          classInstance: true,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(0)
      expect(spyClassInstance).toBeCalledTimes(1)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: no args, no class instance', () => {
      const message = classLoggerFormatterService.start({
        ...dataStart,
        include: {
          ...dataStart.include,
          args: false,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(0)
      expect(spyClassInstance).toBeCalledTimes(0)
      expect(spyFinal).toBeCalledTimes(1)
    })
  })

  describe(ClassLoggerFormatterService.prototype.end.name, () => {
    let spyBase: jest.MockInstance<any, any[]>
    let spyOperation: jest.MockInstance<any, any[]>
    let spyArgs: jest.MockInstance<any, any[]>
    let spyClassInstance: jest.MockInstance<any, any[]>
    let spyResult: jest.MockInstance<any, any[]>
    let spyFinal: jest.MockInstance<any, any[]>
    beforeEach(() => {
      spyBase = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'base')
      spyOperation = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'operation')
      spyArgs = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'args')
      spyClassInstance = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'classInstance')
      spyResult = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'result')
      spyFinal = jest.spyOn(ClassLoggerFormatterService.prototype as any, 'final')
    })

    test('includes: args, no class instance, result', () => {
      const message = classLoggerFormatterService.end(dataEnd)
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyOperation).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(1)
      expect(spyClassInstance).toBeCalledTimes(0)
      expect(spyResult).toBeCalledTimes(1)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: args (complex), no class instance, result', () => {
      const message = classLoggerFormatterService.end({
        ...dataEnd,
        include: {
          ...dataEnd.include,
          args: {
            end: true,
            start: false,
          },
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyOperation).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(1)
      expect(spyClassInstance).toBeCalledTimes(0)
      expect(spyResult).toBeCalledTimes(1)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: args, no class instance, no result', () => {
      const message = classLoggerFormatterService.end({
        ...dataEnd,
        include: {
          ...dataEnd.include,
          result: false,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyOperation).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(1)
      expect(spyClassInstance).toBeCalledTimes(0)
      expect(spyResult).toBeCalledTimes(0)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: args, class instance, result', () => {
      const message = classLoggerFormatterService.end({
        ...dataEnd,
        include: {
          ...dataEnd.include,
          classInstance: true,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyOperation).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(1)
      expect(spyClassInstance).toBeCalledTimes(1)
      expect(spyResult).toBeCalledTimes(1)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: args, class instance, no result', () => {
      const message = classLoggerFormatterService.end({
        ...dataEnd,
        include: {
          ...dataEnd.include,
          classInstance: true,
          result: false,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyOperation).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(1)
      expect(spyClassInstance).toBeCalledTimes(1)
      expect(spyResult).toBeCalledTimes(0)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: no args, class instance, result', () => {
      const message = classLoggerFormatterService.end({
        ...dataEnd,
        include: {
          ...dataEnd.include,
          args: false,
          classInstance: true,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyOperation).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(0)
      expect(spyClassInstance).toBeCalledTimes(1)
      expect(spyResult).toBeCalledTimes(1)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: no args, class instance, no result', () => {
      const message = classLoggerFormatterService.end({
        ...dataEnd,
        include: {
          ...dataEnd.include,
          args: false,
          classInstance: true,
          result: false,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyOperation).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(0)
      expect(spyClassInstance).toBeCalledTimes(1)
      expect(spyResult).toBeCalledTimes(0)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: no args, no class instance, result', () => {
      const message = classLoggerFormatterService.end({
        ...dataEnd,
        include: {
          ...dataEnd.include,
          args: false,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyOperation).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(0)
      expect(spyClassInstance).toBeCalledTimes(0)
      expect(spyResult).toBeCalledTimes(1)
      expect(spyFinal).toBeCalledTimes(1)
    })
    test('includes: no args, no class instance, no result', () => {
      const message = classLoggerFormatterService.end({
        ...dataEnd,
        include: {
          ...dataEnd.include,
          args: false,
          result: false,
        },
      })
      expect(message).toBeTruthy()

      expect(spyBase).toBeCalledTimes(1)
      expect(spyOperation).toBeCalledTimes(1)
      expect(spyArgs).toBeCalledTimes(0)
      expect(spyClassInstance).toBeCalledTimes(0)
      expect(spyResult).toBeCalledTimes(0)
      expect(spyFinal).toBeCalledTimes(1)
    })
  })
})
