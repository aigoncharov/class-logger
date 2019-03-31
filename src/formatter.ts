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
export type IClassLoggerFormatterStartData = IClassLoggerLogData & { include: IClassLoggerIncludeConfig }
export type IClassLoggerFormatterEndData = IClassLoggerFormatterStartData & IClassLoggerLogResData
export interface IClassLoggerFormatter {
  start: (data: IClassLoggerFormatterStartData) => string
  end: (data: IClassLoggerFormatterEndData) => string
}

export interface IClassLoggerMessageConfigArgsComplex {
  start: boolean
  end: boolean
}
export interface IClassLoggerIncludeConfig {
  args: boolean | IClassLoggerMessageConfigArgsComplex
  constructor: boolean
  result: boolean
}

export class ClassLoggerFormatterDefault implements IClassLoggerFormatter {
  public start(data: IClassLoggerFormatterStartData) {
    let message = this.base(data)
    if (data.include.args) {
      message += this.args(data)
    }
    message += this.final()
    return message
  }
  public end(data: IClassLoggerFormatterEndData) {
    let message = this.base(data)
    message += this.operation(data)
    if (data.include.args) {
      message += this.args(data)
    }
    if (data.include.result) {
      message += this.result(data)
    }
    message += this.final()
    return message
  }

  protected base({ className, methodName }: IClassLoggerFormatterStartData) {
    return `${className}.${methodName}`
  }
  protected operation({ error }: IClassLoggerFormatterEndData) {
    return error ? ' -> error' : ' -> done'
  }
  protected args({ args }: IClassLoggerFormatterStartData) {
    return `. Args: ${this.argsToString(args)}`
  }
  protected result({ result }: IClassLoggerFormatterEndData) {
    return `. Res: ${this.resultToString(result)}`
  }
  protected final() {
    return '.'
  }

  protected argsToString(args: any[]) {
    return args.map((arg) => stringify(arg)).join(', ')
  }
  protected resultToString(res: any) {
    return typeof res === 'object' ? stringify(res) : res
  }
}
