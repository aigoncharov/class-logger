# class-logger [![Build Status](https://travis-ci.org/aigoncharov/class-logger.svg?branch=master)](https://travis-ci.org/aigoncharov/class-logger) [![Coverage Status](https://coveralls.io/repos/github/aigoncharov/class-logger/badge.svg?branch=master)](https://coveralls.io/github/aigoncharov/class-logger?branch=master) [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Boilerplate-free%20decorator-based%20class%20logging.&url=https://github.com/aigoncharov/class-logger&hashtags=typescript,javascript,decorators,logging)

Boilerplate-free decorator-based class logging. Log method calls and creation of your class easily with the help of two decorators. No prototype mutation. Highly configurable. Built with TypeScript. Works with Node.js and in browser.

```ts
@LogClass()
class Test {
  @Log()
  method1() {
    return 123
  }
}
```

Logs `Test.construct. Args: [].` before a class instance is created.
Logs `Test.method1. Args: [].` before the method call.
Logs `Test.method1 -> done. Args: []. Res: 123.` after it.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Requirements](#requirements)
- [Quick start (Live demo)](#quick-start-live-demo)
- [Configuration](#configuration)
  - [Configuration object](#configuration-object)
  - [Hierarchical config (Live demo)](#hierarchical-config-live-demo)
    - [Global config](#global-config)
    - [Class config](#class-config)
    - [Method config](#method-config)
  - [Include](#include)
    - [classInstance](#classinstance)
  - [Examples](#examples)
    - [Disable logging of arguments for all messages](#disable-logging-of-arguments-for-all-messages)
    - [Disable logging of arguments for end messages](#disable-logging-of-arguments-for-end-messages)
    - [Enable logging of a formatted class instance for all messages](#enable-logging-of-a-formatted-class-instance-for-all-messages)
    - [Enable logging of a formatted class instance for end messages](#enable-logging-of-a-formatted-class-instance-for-end-messages)
    - [Disable logging of class construction](#disable-logging-of-class-construction)
    - [Disable logging of method's return value (or thrown error)](#disable-logging-of-methods-return-value-or-thrown-error)
    - [Change logger](#change-logger)
- [Formatting](#formatting)
  - [Examples](#examples-1)
    - [Add timestamp (Live demo)](#add-timestamp-live-demo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

1. Run

   ```
   npm i class-logger reflect-metadata
   ```

2. If you use TypeScript set in you tsconfig.json

   ```json
   {
     "compilerOptions": {
       "experimentalDecorators": true,
       "emitDecoratorMetadata": true
     }
   }
   ```

3. If you use JavaScript configure your babel to support decorators and class properties
4. At the top of your project root file add

   ```ts
   import 'reflect-metadata'
   ```

## Requirements

Your environment must support [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). For Node.js it's [6.4.0+](https://node.green/), for browsers it's [Edge 12+, Firefox 18+, Chrome 49+, Safari 10+](https://caniuse.com/#search=proxy).

## Quick start [(Live demo)](https://stackblitz.com/edit/class-logger-demo-basic)

You can log:

- Class construction
- Prototype and static method calls, both: synchronous and asynchronous. Any thrown errors are properly logged and re-thrown.
- Own and static property calls if those properties return functions (synchronous or asynchronous). Error handling is the same as for method calls.

```ts
import { LogClass, Log } from 'class-logger'

@LogClass()
class Test {
  @Log()
  method1() {
    return 123
  }

  @Log()
  async methodAsync1() {
    // do something asynchronous
    return Symbol()
  }

  @Log()
  methodError() {
    throw new Error()
  }

  @Log()
  property1 = () => null

  @Log()
  static methodStatic1(arg1) {
    return {
      prop1: 'test',
    }
  }
}

// Logs to the console before the method call:
// 'Test.methodStatic1. Args: [42].'
Test.methodStatic1(42)
// Logs to the console after the method call:
// 'Test.methodStatic1 -> done. Args: [42]. Res: {"prop1":"test"}.'

// Logs to the console before the class' construction:
// 'Test.construct. Args: [].'
const test = new Test()

// Logs to the console before the method call:
// 'Test.method1. Args: [].'
test.method1()
// Logs to the console after the method call:
// 'Test.method1 -> done. Args: []. Res: 123.'

// Logs to the console before the method call:
// 'Test.methodAsync1. Args: [].'
test.methodAsync1()
// Logs to the console after the method call (after the promise is resolved):
// 'Test.methodAsync1 -> done. Args: []. Res: Symbol().'

// Logs to the console before the method call:
// 'Test.methodError. Args: [].'
test.methodError()
// Logs to the console after the method call:
// 'Test.methodError -> error. Args: []. Res: Error {"name":"Error","message":"","stack":"some stack trace"}.'

// Logs to the console before the method call:
// 'Test.property1. Args: [].'
test.property1()
// Logs to the console after the method call:
// 'Test.property1 -> done. Args: []. Res: null.'
```

## Configuration

### Configuration object

Here's how the configuration object looks like:

```ts
interface IClassLoggerConfig {
  // Function to do the actual logging of the final formatted message.
  // It's used to log messages before method calls, after successful method calls and before class construction calls.
  // Default: console.log
  log?: (message: string) => void
  // Function to do the actual logging of the final formatted error message.
  // It's used to log messages after error method calls.
  // Default: console.error
  logError?: (message: string) => void
  // An object with methods `start` and `end` used to format message data into a string.
  // That string is consumed by `log` and `logError`.
  // Scroll down to 'Formatting' section to read more.
  // Default: new ClassLoggerFormatterService()
  formatter?: {
    start: (data: IClassLoggerFormatterStartData) => string
    end: (data: IClassLoggerFormatterEndData) => string
  }
  // Config of what should be included in the final message
  include?: {
    // Whether to include a list of method arguments.
    // Could be a boolean or an object with boolean properties `start` and `end`.
    // If it's a boolean, it enables/disables the argument list for all log messages.
    // If it's an object, then
    // the `start` property enables/disables the argument list for log messages before method calls and class construction calls,
    // the `end` property enables/disables the argument list for log messages after successful and error method calls.
    // Default: `true`
    args:
      | boolean
      | {
          start: boolean
          end: boolean
        }
    // Whether to log class construction or not
    // Default: `true`
    construct: boolean
    // Whether to include the result for log messages after successful method calls
    // or the error after error method calls.
    // Default: `true`
    result: boolean
    // Whether to include a formatted instance of the class. Useful if have complex logic inside of your methods relying on some properties in your instance. Read about it more down below in a dedicated section.
    // Could be a boolean or an object with boolean properties `start` and `end`.
    // If it's a boolean, it enables/disables the formatted class instance for all log messages.
    // If it's an object, then
    // the `start` property enables/disables the formatted class instance for log messages before method calls and class construction calls,
    // the `end` property enables/disables the formatted class instance for log messages after successful and error method calls.
    // Default: `false`
    classInstance:
      | boolean
      | {
          start: boolean
          end: boolean
        }
  }
}
```

### Hierarchical config [(Live demo)](https://stackblitz.com/edit/class-logger-demo-hierarchical-config)

There're 3 layers of config:

- Global
- Class
- Method

Every time `class-logger` logs a message all 3 of them are merged together.

#### Global config

You can set it using `setConfig` function from `class-logger`.

```ts
import { setConfig } from 'class-logger'

setConfig({
  // Your config override.
  // It's merged with the default config.
})
```

#### Class config

You can set it using `LogClass` decorator from `class-logger`.

```ts
import { LogClass } from 'class-logger'

LogClass({
  // Your config override.
  // It's later merged with the global config for every method call.
  // It means you can set it dynamically.
})
class Test {}
```

#### Method config

You can set it using `Log` decorator from `class-logger`.

```ts
import { Log } from 'class-logger'

LogClass()
class Test {
  @Log({
    // Your config override.
    // It's later merged with the class config and the global config for every method call.
    // It means you can set it dynamically.
  })
  method1() {}
}
```

### Include

#### classInstance

It enables/disabled including the formatted class instance to your log messages. But what does 'formatted' really mean here? So if you decide to include it (remember, it's `false` by default), default class formatter (`ClassLoggerFormatterService`) is going to execute this sequence:

- Take own (non-prototype) properties of an instance.
  - Why? It's a rare case when your prototype changes dynamically, therefore it hardly makes any sense to log it.
- Drop any of them that have `function` type.
  - Why? Most of the time `function` properties are just immutable arrow functions used instead of regular class methods to preserve `this` context. It doesn't make much sense to bloat your logs with stringified bodies of those functions.
- Transform any of them that are not plain objects recursively.
  - What objects are plain ones? `ClassLoggerFormatterService` considers an object a plain object if its prototype is strictly equal to `Object.prototype`.
  - Why? Often we include instances of other classes as properties (inject them as dependencies). By stringifying them using the same algorithm we can see what we injected.
- Stringify what's left.

Example:

```ts
class ServiceA {}

@LogClass({
  include: {
    classInstance: true,
  },
})
class Test {
  private serviceA = new ServiceA()
  private prop1 = 42
  private prop2 = { test: 42 }
  private method1 = () => null

  @Log()
  public method2() {
    return 42
  }
}

// Logs to the console before the class' construction:
// 'Test.construct. Args: []. Class instance: {"serviceA": ServiceA {},"prop1":42,"prop2":{"test":42}}.'
const test = new Test()

// Logs to the console before the method call:
// 'Test.method2. Args: []. Class instance: {"serviceA": ServiceA {},"prop1":42,"prop2":{"test":42}}.'
test.method2()
// Logs to the console after the method call:
// 'Test.method2 -> done. Args: []. Class instance: {"serviceA": ServiceA {},"prop1":42,"prop2":{"test":42}}. Res: 42.'
```

> If a class instance is not available at the moment (e.g. for class construction or calls of static methods), it logs `N/A`.

### Examples

#### Disable logging of arguments for all messages

```ts
{
  include: {
    args: false
  }
}
```

#### Disable logging of arguments for end messages

```ts
{
  include: {
    args: {
      start: true
      end: false
    }
  }
}
```

#### Enable logging of a formatted class instance for all messages

```ts
{
  include: {
    classInstance: true
  }
}
```

#### Enable logging of a formatted class instance for end messages

```ts
{
  include: {
    classInstance: {
      start: true
      end: false
    }
  }
}
```

#### Disable logging of class construction

```ts
{
  include: {
    construct: false
  }
}
```

#### Disable logging of method's return value (or thrown error)

```ts
{
  include: {
    result: false
  }
}
```

#### Change logger

```ts
{
  log: myLogger.debug,
  logError: myLogger.error
}
```

Which could look like this in real world:

```ts
import { setConfig } from 'class-logger'
import { createLogger } from 'winston'

const logger = createLogger()

setConfig({
  log: logger.debug.bind(logger),
  logError: logger.error.bind(logger),
})
```

## Formatting

You can pass your own custom formatter to the config to format messages to your liking.

```ts
{
  formatter: myCustomFormatter
}
```

Your custom formatter must be an object with properties `start` and `end`. It must comply with the following interface:

```ts
interface IClassLoggerFormatter {
  start: (data: IClassLoggerFormatterStartData) => string
  end: (data: IClassLoggerFormatterEndData) => string
}
```

where `IClassLoggerFormatterStartData` is:

```ts
interface IClassLoggerFormatterStartData {
  args: any[]
  className: string
  propertyName: string | symbol
  classInstance?: any
  include: {
    args:
      | boolean
      | {
          start: boolean
          end: boolean
        }
    construct: boolean
    result: boolean
    classInstance:
      | boolean
      | {
          start: boolean
          end: boolean
        }
  }
}
```

and `IClassLoggerFormatterEndData` is:

```ts
interface IClassLoggerFormatterEndData {
  args: any[]
  className: string
  propertyName: string | symbol
  classInstance?: any
  result: any
  error: boolean
  include: {
    args:
      | boolean
      | {
          start: boolean
          end: boolean
        }
    construct: boolean
    result: boolean
    classInstance:
      | boolean
      | {
          start: boolean
          end: boolean
        }
  }
}
```

You can provide your own object with these two properties, but the easiest way to modify the formatting logic of `class-logger` is to subclass the default formatter - `ClassLoggerFormatterService`.

`ClassLoggerFormatterService` has these `protected` methods which are building blocks of final messages:

- `base`
- `operation`
- `args`
- `classInstance`
- `result`
- `final`

Generally speaking, `start` method of `ClassLoggerFormatterService` is `base` + `args` + `classInstance` + `final`. `end` is `base` + `operation` + `args` + `classInstance` + `result` + `final`.

### Examples

#### Add timestamp [(Live demo)](https://stackblitz.com/edit/class-logger-demo-custom-formatter-add-timestamp)

Let's take a look at how we could add a timestamp to the beginning of each message:

```ts
import { ClassLoggerFormatterService, IClassLoggerFormatterStartData, setConfig } from 'class-logger'

class ClassLoggerTimestampFormatterService extends ClassLoggerFormatterService {
  protected base(data: IClassLoggerFormatterStartData) {
    const baseSuper = super.base(data)
    const timestamp = Date.now()
    const baseWithTimestamp = `${timestamp}:${baseSuper}`
    return baseWithTimestamp
  }
}

setConfig({
  formatter: new ClassLoggerTimestampFormatterService(),
})
```

> FYI, [winston](https://github.com/winstonjs/winston), [pino](https://github.com/pinojs/pino) and pretty much any other logger are capable of adding timestamps on their own, so this example is purely educative. I'd advice to use your logger's built-in mechanism for creating timestamps if possible.
