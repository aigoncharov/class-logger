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
  protected readonly placeholderUndefined = 'undefined'

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
    return `. Args: ${this.valueToString(args)}`
  }
  protected classInstance({ classInstance }: IClassLoggerFormatterStartData) {
    return `. Class instance: ${this.complexObjectToString(classInstance)}`
  }
  protected result({ result }: IClassLoggerFormatterEndData) {
    return `. Res: ${this.valueToString(result)}`
  }
  protected final() {
    return '.'
  }

  protected complexObjectToString(obj: any) {
    if (typeof obj !== 'object') {
      return this.placeholderNotAvailable
    }

    if (obj === null) {
      return stringify(obj)
    }

    const classInstanceFiltered: { [key: string]: any } = {}

    let keys = Object.keys(obj)
    if (obj instanceof Map || obj instanceof Set) {
      keys = [...obj.keys()]
    }

    keys.forEach((key) => {
      const value = obj[key]
      if (typeof value === 'function') {
        return
      }
      classInstanceFiltered[key] =
        typeof value === 'object' && !this.isPlainObjectOrArray(value) ? this.complexObjectToString(value) : value
    })
    return `${obj.constructor.name} ${stringify(classInstanceFiltered)}`
  }
  protected valueToString(val: any): string {
    if (val === undefined) {
      return this.placeholderUndefined
    }
    if (typeof val !== 'object') {
      return val.toString()
    }
    if (val instanceof Error) {
      return this.errorToString(val)
    }
    if (!this.isPlainObjectOrArray(val)) {
      return this.complexObjectToString(val)
    }
    if (Array.isArray(val)) {
      const arrayWithStringifiedElements = val.map(this.valueToString.bind(this))
      return `[${arrayWithStringifiedElements.join(', ')}]`
    }
    return stringify(val)
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
  protected errorToString(error: Error & { code?: string }) {
    const data = {
      code: error.code,
      message: error.message,
      name: error.name,
      stack: error.stack,
    }
    return `${error.constructor.name} ${stringify(data)}`
  }
}
