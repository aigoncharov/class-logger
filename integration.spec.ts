import 'reflect-metadata'

import { Container, inject, injectable } from 'inversify'

import { Log, LogClass, setConfig } from './index'

describe('integration', () => {
  // https://github.com/aigoncharov/class-logger/issues/6
  describe('inversify', () => {
    it('', () => {
      const logFn = jest.fn()

      setConfig({
        include: {
          construct: true,
        },
        log: logFn,
      })

      const TYPES = {
        AI: Symbol.for('AI'),
        CPU: Symbol.for('CPU'),
      }

      @LogClass()
      @injectable()
      class CPU {
        private readonly res = 42

        @Log()
        public calc() {
          return this.res
        }
      }

      @LogClass()
      @injectable()
      class AI {
        constructor(@inject(TYPES.CPU) private readonly _cpu: CPU) {}

        @Log()
        public takeOverTheWorld() {
          return this._cpu.calc() * 2
        }
      }

      const myContainer = new Container()
      myContainer.bind(TYPES.CPU).to(CPU)
      myContainer.bind(TYPES.AI).to(AI)

      const cpu = myContainer.get<CPU>(TYPES.CPU)
      expect(cpu).toBeInstanceOf(CPU)

      const ai = myContainer.get<AI>(TYPES.AI)
      expect(ai).toBeInstanceOf(AI)

      const res = ai.takeOverTheWorld()
      expect(res).toBe(84)

      expect(logFn).toBeCalledTimes(7)
      expect(logFn.mock.calls).toEqual([
        // Getting CPU from the container explicitly
        ['CPU.construct. Args: [].'],
        // Injecting CPU into AI
        ['CPU.construct. Args: [].'],
        ['AI.construct. Args: [CPU {"res":42}].'],
        ['AI.takeOverTheWorld. Args: [].'],
        ['CPU.calc. Args: [].'],
        ['CPU.calc -> done. Args: []. Res: 42.'],
        ['AI.takeOverTheWorld -> done. Args: []. Res: 84.'],
      ])
    })
  })
})
