import { ConfigService, IClassLoggerConfig } from './config.service'

describe(ConfigService.name, () => {
  describe(ConfigService.configsMerge.name, () => {
    test('returns a merged config', () => {
      const config = ConfigService.config
      ConfigService.config = new Proxy(config, {
        set() {
          throw new Error('Must not reassign config properties!')
        },
      })

      const configOverride: IClassLoggerConfig = {
        include: {
          args: {
            end: true,
            start: false,
          },
        },
        logError: () => undefined,
      }
      const configRes = ConfigService.configsMerge(ConfigService.config, configOverride)
      expect(configRes).toEqual({
        ...config,
        ...configOverride,
        include: {
          ...config.include,
          ...configOverride.include,
        },
      })

      ConfigService.config = config
    })
  })

  describe(ConfigService.setConfig.name, () => {
    test(`sets ${ConfigService.name}.config`, () => {
      const spyConfigsMerge = jest.spyOn(ConfigService, 'configsMerge')

      const configOld = ConfigService.config
      const configOverride: IClassLoggerConfig = {
        include: {
          args: {
            end: true,
            start: false,
          },
        },
        logError: () => undefined,
      }
      ConfigService.setConfig(configOverride)
      expect(spyConfigsMerge).toBeCalledTimes(1)
      expect(spyConfigsMerge).toBeCalledWith(configOld, configOverride)
      expect(ConfigService.config).not.toBe(configOld)
    })
  })
})
