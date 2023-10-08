[![npm-badge][npm-badge]][npm]
[![actions-badge][actions-badge]][actions]
![types-badge][types-badge]

# @veloze/validate

> A schema validator

Easy type validator with type validation functions.
The validator bails out on first encountered schema violation.

Less than 6k if minimized.

**Table of Contents**

<!-- !toc -->

* [@veloze/validate](#velozevalidate)
* [Usage](#usage)
* [API](#api)
  * [booleanT()](#booleant)
  * [numberT()](#numbert)
  * [integerT()](#integert)
  * [stringT()](#stringt)
    * [stringDateTimeT()](#stringdatetimet)
    * [stringUrlT()](#stringurlt)
    * [stringUuidT()](#stringuuidt)
  * [enumT()](#enumt)
  * [arrayT()](#arrayt)
  * [objectT()](#objectt)
  * [oneOf()](#oneof)
  * [anyOf()](#anyof)
  * [toJsonSchema()](#tojsonschema)
* [License](#license)

<!-- toc! -->

# Usage

Installation

```
npm i @veloze/validate
```

In your code:

```js
import {
  booleanT,
  numberT,
  integerT,
  stringT,
  arrayT,
  objectT,
  oneOf,
  anyOf,
  REQUIRED, // == { required: true }
  ADD_PROPS, // == { additionalProperties: true }
} from '@veloze/validate'

// alternatively
import { type as t, oneOf, anyOf } from '@veloze/validate'
// then use `t.boolean()` instead of `booleanT()` aso...

const schema = objectT(
  {
    bool: booleanT(), // optional boolean
    num: numberT({ min: -1, max: 10 }), // optional number [-1..10[
    int: integerT({ min: 0, max: 10 }), // optional integer [0,1,..9]
    str: stringT(), // optional string
    arr: arrayT(oneOf([stringT(), integerT()])), // optional array of string or integers
    obj: objectT(
      {
        // required nested object with
        nested: stringT(), // optional string
      },
      REQUIRED
    ),
    any: anyOf([
      // either or both
      objectT({ flag: booleanT() }, ADD_PROPS),
      objectT({ test: integerT() }, ADD_PROPS),
    ]),
  },
  { ...REQUIRED, additionalProperties: true }
)

let e = {}
let valid = schema({ obj: {}, other: true }, e)
console.log(valid, e) // true {}

e = {}
valid = schema({ bool: true, num: '123' }, e)
console.log(valid, e) // false { message: 'not a number', path: [ 'num' ] }

e = {}
valid = schema({ arr: ['a', 1, 1.2] }, e)
console.log(valid, e)
// false { path: [ 'arr', '2' ], message: 'oneOf failed, matches 0 schemas' }

e = {}
valid = schema({ any: { flag: true, test: '1' }, obj: {} }, e)
console.log('%s %j', valid, e)
// false {"path":["any"],"failures":[{"path":["test"],"message":"not a number"}],"message":"anyOf failed"}
```

# API

Each validation function returns the type signature:

```ts
export type ValidationFn = (v: any, e?: ValidationFailure) => boolean
```

In case of failure the reason for the validation failure is returned in the optional ValidationFailure object.

```js
const schema = numberT()
const failure = {}
schema('str', failure)
// failure == { message: 'not a number' }
```

## booleanT()

Validates if type is boolean.

_typedef_

```ts
export function booleanT(
  opts?:
    | {
        required?: boolean | undefined
        validate?: ((v: boolean, e?: ValidationFailure) => boolean) | undefined
      }
    | undefined
): ValidationFn
```

_usage_

```js
// optional
const schema = booleanT()
schema(undefined) // true
schema(true) // true
schema(false) // true
schema('true') // false

// type is required
const schema = booleanT({ required: true })
schema(undefined) // false
schema(true) // true
schema(false) // true
schema('true') // false

// with custom validate function
const schema = booleanT({ validate: (v) => v === false })
schema(true) // false
schema(false) // true
```

## numberT()

Validates if type is number.

_typedef_

```ts
export function numberT(
  opts?:
    | {
        required?: boolean | undefined
        min?: number | undefined
        max?: number | undefined
        exclusiveMin?: boolean | undefined // @default = false
        exclusiveMax?: boolean | undefined // @default = false
        validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined
      }
    | undefined
): ValidationFn
```

_usage_

```js
// optional
const schema = numberT()
schema(undefined) // true
schema(0.1) // true
schema('0') // false

// type is required
const schema = numberT({ required: true })
schema(undefined) // false
schema(0.1) // true

// min, max check
const schema = numberT({ min: 0, max: 1, exclusiveMax: true })
schema(0) // true
schema(1) // false
schema(0.9999) // true
```

## integerT()

Validates if type is integer.

_typedef_

```ts
export function integerT(
  opts?:
    | {
        required?: boolean | undefined
        min?: number | undefined
        max?: number | undefined
        exclusiveMin?: boolean | undefined // @default = false
        exclusiveMax?: boolean | undefined // @default = false
        validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined
      }
    | undefined
): ValidationFn
```

_usage_

```js
// optional
const schema = integerT()
schema(undefined) // true
schema(0.1) // false
schema(1) // true

// min, max check
const schema = numberT({ min: 0, max: 2, exclusiveMax: true })
schema(0) // true
schema(2) // false
```

## stringT()

Validates if type is string.
Defaults to minimum length 0 and maximum length 255.

_typedef_

```ts
export function stringT(
  opts?:
    | {
        required?: boolean | undefined
        min?: number | undefined // @default = 0
        max?: number | undefined // @default = 255
        pattern?: RegExp | undefined
        validate?: ((v: string, e?: ValidationFailure) => boolean) | undefined
      }
    | undefined
): (v: any, e: ValidationFailure) => boolean
```

For string format validation the following functions are provided:

- _validateDateTime_: Date-time checks
- _validateUrl_: URL checks
- _validateUuid_: UUID checks

_usage_

```js
// optional
const schema = stringT()
schema(undefined) // true
schema('') // true
schema('text') // true
schema(0.1) // false

// type is required
const schema = stringT({ required: true })
schema(undefined) // false
schema('') // false
schema('text') // true

// pattern check
const schema = stringT({ pattern: /^ab/ })
schema('abc') // true
schema('bcd') // false

// string format URL check using validateUrl
const schema = stringT({ validate: validateUrl})
schema('https://foo.bar', true)
schema('/foo.bar', false)
```

### stringDateTimeT()

String validation for date-time strings. Uses validateDateTime() validate function.

### stringUrlT()

String validation for URL strings. Uses validateUrl() validate function.

_usage_

```js
const schema = stringUrlT()
schema('https://foo.bar', true)
schema('/foo.bar', false)
```

### stringUuidT()

String validation for UUID strings. Uses validateUuid() validate function.


## enumT()

Validates for allowed list of values.

_typedef_

```ts
export function enumT(
  list: any[],
  opts?:
    | {
        required?: boolean | undefined
      }
    | undefined
): ValidationFn
```

_usage_

```js
// optional number type
const schema = enumT([2, 4, 8])
schema(undefined) // true
schema(2) // true
schema(3) // false

// mixed types
const schema = enumT([2, 'four'])
schema(2) // true
schema('four') // true
```

## arrayT()

Validates array for given schema.
Defaults to minimum array length of 0 and maximum array length of 255 items.

_typedef_

```ts
export function arrayT(
  schema: ValidationFn,
  opts?:
    | {
        required?: boolean | undefined
        min?: number | undefined // @default = 0
        max?: number | undefined // @default = 255
        validate?: ((v: any[], e: ValidationFailure) => boolean) | undefined
      }
    | undefined
): (v: any, e: ValidationFailure) => boolean
```

_usage_

```js
const subschema = numberT({ min: 0, max: 100, exclusiveMax: true })
const schema = arrayT(subschema, { ...REQUIRED, min: 2, max: 10 })

schema([0, 55, 12]) // true

const failure = {}
schema([4, -2, 4], failure)
// failure == { message: 'number less than min=0', path: [ '1' ] }
```

## objectT()

Validates an object.
Defaults to min=0 and max=255 properties.

_typedef_

```ts
export function objectT(
  schema: {
    [key: string]: ValidationFn
  },
  opts?:
    | {
        required?: boolean | undefined
        min?: number | undefined // @default = 0 properties
        max?: number | undefined // @default = 255 properties
        additionalProperties?: boolean | undefined
        validate?: ((v: object, e?: ValidationFailure) => boolean) | undefined
      }
    | undefined
): ValidationFn
```

_usage_

````js
const subschema = {
  num: numberT({ min: 0, max: 100, exclusiveMax: true }),
  str: stringT(REQUIRED),
}
const schema = objectT(subschema, { ...REQUIRED, ...ADD_PROPS, min: 1 })

schema({ str: 'hi', num: 2 }) // true

let failure = {}
schema({}, failure)
// failure == { message: 'object has less than 1 properties' }

failure = {}
schema({ str: 1 }, failure)
// failure == { path: [ 'str' ], message: 'not a string' }

failure = {}
schema({ str: 'hi', num: 'abc' }, failure)
// failure == { path: [ 'num' ], message: 'not a number' }```
````

## oneOf()

Data must be valid against exactly one of the given schemas.

_typedef_

```ts
export function oneOf(schemas: ValidationFn[]): ValidationFn
```

_usage_

```js
// schema must either be a string or a number
const schema = oneOf([stringT(REQUIRED), numberT(REQUIRED)])
```

## anyOf()

Data must be valid against any (one or more) of the given schemas

_typedef_

```ts
export function anyOf(schemas: ValidationFn[]): ValidationFn
```

_usage_

```js
// object must either contain { str: string } or { num: number } or both
const schema = anyOf([
  objectT({ str: stringT(REQUIRED) }, ADD_PROPS),
  objectT({ num: numberT(REQUIRED) }, ADD_PROPS),
])

schema({}, failure) // false
// failure == {"failures":[{"path":["str"],"message":"not a string"},{"path":["num"],"message":"not a number"}],"message":"anyOf failed"}
schema({ str: '' }) // true

schema({ num: 0 }) // true

schema({ str: '', num: 0 }) // true
```

## toJsonSchema()

A schema can be exported to JSON schema except 

- any custom validate functions
- dateT() validator

A conversion from JSON schema is not supported.

_usage_

```js
import { toJsonSchema } from '@veloze/validator'

const schema = oneOf([
  objectT({
    num: numbertT(),
    str: stringT()
  }),
  booleanT()
])

toJsonSchema(object)
// {
//   oneOf: [
//     {
//       type: 'object',
//       properties: {
//         num: { type: 'number' },
//         str: { type: 'string' }
//       }
//     },
//     bool: { type: 'boolean' }
//   ]
// }
```


# License

[MIT licensed](./LICENSE)

[npm-badge]: https://badgen.net/npm/v/@veloze/validate
[npm]: https://www.npmjs.com/package/@veloze/validate
[types-badge]: https://badgen.net/npm/types/@veloze/validate
[actions-badge]: https://github.com/commenthol/veloze-validate/workflows/CI/badge.svg?branch=main&event=push
[actions]: https://github.com/commenthol/veloze-validate/actions/workflows/ci.yml?query=branch%3Amain
