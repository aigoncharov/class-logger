# class-logger [![Build Status](https://travis-ci.org/keenondrums/class-logger.svg?branch=master)](https://travis-ci.org/keenondrums/class-logger) [![Coverage Status](https://coveralls.io/repos/github/keenondrums/class-logger/badge.svg?branch=master)](https://coveralls.io/github/keenondrums/class-logger?branch=master) [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Boilerplate-free%20decorator-based%20class%20logging.&url=https://github.com/keenondrums/class-logger&hashtags=typescript,javascript,decorators,logging)

Boilerplate-free decorator-based class logging. Log method calls and creation of your class easily with a help of two decorators. No prototype mutation. Highly configurable. Built with TypeScript.

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
- [Quick start](#quick-start)

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

## Quick start

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
// 'Test.methodError -> error. Args: []. Res: {"className":"Error","name":"Error","message":"","stack":"some stack trace"}.'

// Logs to the console before the method call:
// 'Test.property1. Args: [].'
test.property1()
// Logs to the console after the method call:
// 'Test.property1 -> done. Args: []. Res: null.'
```
