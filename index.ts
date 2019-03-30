import stringify from 'fast-safe-stringify'

export const CLASS_LOGGER_METADATA_KEY = Symbol()

export interface IClassLoggerLogData {
  args: any[]
  className: string
  methodName: string
  classInstance: any
}
export interface IClassLoggerLogResData {
  result: any
  error: boolean
}
type ClassLoggerFormatterUniversal = (
  data: IClassLoggerLogData & IClassLoggerMessageConfig & Partial<IClassLoggerLogResData>,
) => string
type ClassLoggerFormatterComplexStart = (data: IClassLoggerLogData & IClassLoggerMessageConfig) => string
type ClassLoggerFormatterComplexEnd = (
  data: IClassLoggerLogData & IClassLoggerMessageConfig & IClassLoggerLogResData,
) => string
interface IClassLoggerFormatterComplex {
  start: ClassLoggerFormatterComplexStart
  end: ClassLoggerFormatterComplexEnd
}
type ClassLoggerFormatterLogger = (message: string) => void
export interface IClassLoggerMessageConfigArgsComplex {
  start: boolean
  end: boolean
}
export interface IClassLoggerMessageConfig {
  message: {
    args: boolean | IClassLoggerMessageConfigArgsComplex
  }
}
export interface IClassLoggerConfig extends IClassLoggerMessageConfig {
  log: ClassLoggerFormatterLogger
  logError?: ClassLoggerFormatterLogger
  format: ClassLoggerFormatterUniversal | IClassLoggerFormatterComplex
}

const argsStringify = (args: any[]) => args.map((arg) => stringify(arg)).join(', ')
const resStringify = (res: any) => (typeof res === 'object' ? stringify(res) : res)

export const formatDefault: ClassLoggerFormatterUniversal = ({
  className,
  methodName,
  args,
  error,
  result,
  message,
}) => {
  const isStart = error === undefined
  let logArgs = true
  if (typeof message.args === 'boolean') {
    logArgs = message.args
  } else {
    logArgs = isStart ? message.args.start : message.args.end
  }
  let res = `${className}.${methodName}`
  if (!isStart) {
    res = `${res} -> ${error ? 'error' : 'done'}`
  }
  if (logArgs) {
    res = `${res}. Args: ${argsStringify(args)}`
  }
  if (!isStart) {
    res = `${res}. Res: ${resStringify(result)}`
  }
  res = `${res}.`
  return res
}

let configDefault: IClassLoggerConfig = {
  format: formatDefault,
  log: console.log, // tslint:disable-line no-console
  logError: console.error, // tslint:disable-line no-console
  message: {
    args: true,
  },
}
export const setConfigDefault = (config: IClassLoggerConfig) => {
  configDefault = config
}

const setConfigClass = (config: Partial<IClassLoggerConfig>) => <T extends new (...args: any[]) => any>(target: T) => {
  Reflect.defineMetadata(CLASS_LOGGER_METADATA_KEY, config, target)
}
