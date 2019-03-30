import stringify from 'fast-safe-stringify'

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
export type ClassLoggerFormatterUniversal = (
  data: IClassLoggerLogData & IClassLoggerMessageConfig & Partial<IClassLoggerLogResData>,
) => string
type ClassLoggerFormatterComplexStart = (data: IClassLoggerLogData & IClassLoggerMessageConfig) => string
type ClassLoggerFormatterComplexEnd = (
  data: IClassLoggerLogData & IClassLoggerMessageConfig & IClassLoggerLogResData,
) => string
export interface IClassLoggerFormatterComplex {
  start: ClassLoggerFormatterComplexStart
  end: ClassLoggerFormatterComplexEnd
}

export interface IClassLoggerMessageConfigArgsComplex {
  start: boolean
  end: boolean
}
export interface IClassLoggerMessageConfig {
  message: {
    args: boolean | IClassLoggerMessageConfigArgsComplex
  }
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
