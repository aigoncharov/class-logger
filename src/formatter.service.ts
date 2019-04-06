import stringify from 'fast-safe-stringify'

export interface IClassLoggerLogData {
  args: any[]
  className: string
  propertyName: string | symbol
  classInstance?: any
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

export interface IClassLoggerMessageConfigIncludeComplex {
  start: boolean
  end: boolean
}
export interface IClassLoggerIncludeConfig {
  args: boolean | IClassLoggerMessageConfigIncludeComplex
  construct: boolean
  result: boolean
  classInstance: boolean | IClassLoggerMessageConfigIncludeComplex
}

export class ClassLoggerFormatterService implements IClassLoggerFormatter {
  protected readonly placeholderNotAvailable = 'N/A'

  public start(data: IClassLoggerFormatterStartData) {
    let message = this.base(data)
    if (this.includeComplex(data.include.args, 'start')) {
      message += this.args(data)
    }
    if (this.includeComplex(data.include.classInstance, 'start')) {
      message += this.classInstance(data)
    }
    message += this.final()
    return message
  }
  public end(data: IClassLoggerFormatterEndData) {
    let message = this.base(data)
    message += this.operation(data)
    if (this.includeComplex(data.include.args, 'end')) {
      message += this.args(data)
    }
    if (this.includeComplex(data.include.classInstance, 'end')) {
      message += this.classInstance(data)
    }
    if (data.include.result) {
      message += this.result(data)
    }
    message += this.final()
    return message
  }

  protected base({ className, propertyName }: IClassLoggerFormatterStartData) {
    return `${className}.${propertyName.toString()}`
  }
  protected operation({ error }: IClassLoggerFormatterEndData) {
    return error ? ' -> error' : ' -> done'
  }
  protected args({ args }: IClassLoggerFormatterStartData) {
    return `. Args: [${this.argsToString(args)}]`
  }
  protected classInstance({ classInstance }: IClassLoggerFormatterStartData) {
    return `. Class instance: ${this.classInstanceToString(classInstance)}`
  }
  protected result({ result }: IClassLoggerFormatterEndData) {
    return `. Res: ${this.resultToString(result)}`
  }
  protected final() {
    return '.'
  }

  protected classInstanceToString(classInstance: any) {
    if (typeof classInstance !== 'object') {
      return this.placeholderNotAvailable
    }
    const classInsanceFiltered: { [key: string]: any } = {}
    for (const key of Object.keys(classInstance)) {
      const value = classInstance[key]
      if (typeof value === 'object' && !this.isPlainObjectOrArray(value)) {
        continue
      }
      classInsanceFiltered[key] = value
    }
    return stringify(classInsanceFiltered)
  }
  protected argsToString(args: any[]) {
    return args.map((arg) => (typeof arg === 'object' ? stringify(arg) : arg.toString())).join(', ')
  }
  protected resultToString(res: any) {
    return typeof res === 'object' ? stringify(res) : res.toString()
  }

  protected includeComplex(
    includeComplex: boolean | IClassLoggerMessageConfigIncludeComplex,
    type: keyof IClassLoggerMessageConfigIncludeComplex,
  ) {
    if (typeof includeComplex === 'boolean') {
      return includeComplex
    }
    return includeComplex[type]
  }
  protected isPlainObjectOrArray(obj: object | null) {
    if (!obj) {
      return false
    }
    const proto = Object.getPrototypeOf(obj)
    return proto === Object.prototype || proto === Array.prototype
  }
}
