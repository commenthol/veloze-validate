[![npm-badge][npm-badge]][npm]
[![actions-badge][actions-badge]][actions]
![types-badge][types-badge]

# @veloze/validate

> A schema validator

Easy type validator.  
The validator bails out on first encountered schema violation.

Less than 8k if minimized, less then 2.5kB if gzipped.

**Table of Contents**

<!-- !toc -->

* [Usage](#usage)
* [API](#api)
  * [booleanT()](#booleant)
  * [numberT()](#numbert)
  * [integerT()](#integert)
  * [stringT()](#stringt)
  * [enumT()](#enumt)
  * [arrayT()](#arrayt)
  * [objectT()](#objectt)
  * [oneOf()](#oneof)
  * [anyOf()](#anyof)
  * [allOf()](#allof)
  * [toJsonSchema()](#tojsonschema)
  * [cast()](#cast)
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
  ADD_PROPS // == { additionalProperties: true }
} from '@veloze/validate'

// alternatively
import { type as t, oneOf, anyOf } from '@veloze/validate'
// then use `t.boolean()` instead of `booleanT()` aso...

const schema = objectT(
  {
    bool: booleanT(), // optional boolean
    num: numberT({ min: -1, max: 10 }), // optional number [-1..10]
    int: integerT().min(0).max(10), // optional integer [0,1,..10]
    str: stringT(), // optional string
    arr: arrayT(oneOf([stringT(), integerT()])), // optional array of string or integers
    obj: objectT(
      {
        // required nested object with
        nested: stringT() // optional string
      },
      REQUIRED
    ),
    any: anyOf([
      // either or both
      objectT({ flag: booleanT() }, ADD_PROPS),
      objectT({ test: integerT() }, ADD_PROPS)
    ])
  }
).required().additionalProperties()

let e = {}
let valid = schema.validate({ obj: {}, other: true }, e)
console.log(valid, e) // true {}

e = {}
valid = schema.validate({ bool: true, num: '123' }, e)
console.log(valid, e) // false { message: 'not a number', path: [ 'num' ] }

e = {}
valid = schema.validate({ arr: ['a', 1, 1.2] }, e)
console.log(valid, e)
// false { path: [ 'arr', '2' ], message: 'oneOf failed, matches 0 schemas' }

e = {}
valid = schema.validate({ any: { flag: true, test: '1' }, obj: {} }, e)
console.log('%s %j', valid, e)
// false {"path":["any"],"failures":[{"path":["test"],"message":"not a number"}],"message":"anyOf failed"}
```

# API

Each validation function returns the type signature:

```ts
type ValidationFn = (v: any, e?: ValidationFailure) => boolean
export interface {
  validate: ValidationFn
}
```

In case of failure the reason for the validation failure is returned in the optional ValidationFailure object.

```js
const schema = numberT()
const failure = {}
schema.validate('str', failure)
// failure == { message: 'not a number' }
```

## booleanT()

Validates if type is boolean.

*typedef*

```ts
export function booleanT(
  opts?:
    | {
        required?: boolean | undefined
        validate?: ((v: boolean, e?: ValidationFailure) => boolean) | undefined
      }
    | undefined
): {
  required(): this
  cast(): this
  custom((v: boolean, e?: ValidationFailure) => boolean): this
  validate(v: any, e?: {}): boolean
  analyze(v: any): ValidationError | undefined
}
```

*usage*

```js
// optional
const schema = booleanT()
schema.validate(undefined) // true
schema.validate(true) // true
schema.validate(false) // true
schema.validate('true') // false

// type is required
const schema = booleanT({ required: true })
schema.validate(undefined) // false
schema.validate(true) // true
schema.validate(false) // true
schema.validate('true') // false

// with custom validate function
const schema = booleanT({ validate: (v) => v === false })
schema.validate(true) // false
schema.validate(false) // true
```

## numberT()

Validates if type is number.

*typedef*

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
): {
  required(): this
  cast(): this
  min(min: number): this
  max(max: number): this
  exclusiveMin(): this
  exclusiveMax(): this
  custom((v: number, e?: ValidationFailure) => boolean): this
  validate(v: any, e?: {}): boolean
}
```

*usage*

```js
// optional
const schema = numberT()
schema.validate(undefined) // true
schema.validate(0.1) // true
schema.validate('0') // false

// type is required
const schema = numberT().required()
schema.validate(undefined) // false
schema.validate(0.1) // true

// min, max check
const schema = numberT({ min: 0, max: 1, exclusiveMax: true })
schema.validate(0) // true
schema.validate(1) // false
schema.validate(0.9999) // true
```

## integerT()

Validates if type is integer.

*typedef*

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
): {
  required(): this
  cast(): this
  min(min: number): this
  max(max: number): this
  exclusiveMin(): this
  exclusiveMax(): this
  custom((v: number, e?: ValidationFailure) => boolean): this
  validate(v: any, e?: {}): boolean
}
```

*usage*

```js
// optional
const schema = integerT()
schema.validate(undefined) // true
schema.validate(0.1) // false
schema.validate(1) // true

// min, max check
const schema = numberT({ min: 0, max: 2, exclusiveMax: true })
schema.validate(0) // true
schema.validate(2) // false
```

## stringT()

Validates if type is string.
Defaults to minimum length 0 and maximum length 255.

*typedef*

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
): {
  required(): this
  cast(): this
  min(min: number): this
  max(max: number): this
  url(): this
  uuid(): this
  dateTime(): this
  pattern(pattern: RegExp): this
  custom((v: number, e?: ValidationFailure) => boolean): this
  validate(v: any, e?: {}): boolean
}
```

For string format validation the following functions are provided:

- _validateDateTime_: Date-time checks
- _validateUrl_: URL checks
- _validateUuid_: UUID checks

*usage*

```js
// optional
const schema = stringT()
schema.validate(undefined) // true
schema.validate('') // true
schema.validate('text') // true
schema.validate(0.1) // false

// type is required
const schema = stringT().required()
schema.validate(undefined) // false
schema.validate('') // false
schema.validate('text') // true

// pattern check
const schema = stringT().pattern(/^ab/)
schema.validate('abc') // true
schema.validate('bcd') // false

// string format URL check using validateUrl
const schema = stringT().url()
schema.validate('https://foo.bar', true)
schema.validate('/foo.bar', false)
```

## enumT()

Validates for allowed list of values.

*typedef*

```ts
export function enumT(
  list: any[],
  opts?:
    | {
        required?: boolean | undefined
      }
    | undefined
): {
  required(): this
  validate(v: any, e?: {}): boolean
}
```

*usage*

```js
// optional number type
const schema = enumT([2, 4, 8])
schema.validate(undefined) // true
schema.validate(2) // true
schema.validate(3) // false

// mixed types
const schema = enumT([2, 'four'])
schema.validate(2) // true
schema.validate('four') // true
```

## arrayT()

Validates array for given schema.
Defaults to minimum array length of 0 and maximum array length of 255 items.

*typedef*

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
): {
  required(): this
  min(min: number): this
  max(max: number): this
  custom((v: any[], e?: ValidationFailure) => boolean): this
  validate(v: any, e?: {}): boolean
}
```

*usage*

```js
const subschema = numberT({ min: 0, max: 100, exclusiveMax: true })
const schema = arrayT(subschema, { ...REQUIRED, min: 2, max: 10 })

schema.validate([0, 55, 12]) // true

const failure = {}
schema.validate([4, -2, 4], failure)
// failure == { message: 'number less than min=0', path: [ '1' ] }
```

## objectT()

Validates an object.
Defaults to min=0 and max=255 properties.

*typedef*

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
): {
  required(): this
  min(min: number): this
  max(max: number): this
  additionalProperties(): this
  custom((v: object, e?: ValidationFailure) => boolean): this
  validate(v: any, e?: {}): boolean
}
```

*usage*

```js
const subschema = {
  num: numberT({ min: 0, max: 100, exclusiveMax: true }),
  str: stringT().required()
}
const schema = objectT(subschema, { ...REQUIRED, ...ADD_PROPS, min: 1 })

schema.validate({ str: 'hi', num: 2 }) // true

let failure = {}
schema.validate({}, failure)
// failure == { message: 'object has less than 1 properties' }

failure = {}
schema.validate({ str: 1 }, failure)
// failure == { path: [ 'str' ], message: 'not a string' }

failure = {}
schema.validate({ str: 'hi', num: 'abc' }, failure)
// failure == { path: [ 'num' ], message: 'not a number' }
```

## oneOf()

Data must be valid against exactly one of the given schemas.

*typedef*

```ts
export function oneOf(schemas: BaseT[]): {
  validate(v: any, e?: {}): boolean;
}
```

*usage*

```js
// schema must either be a string or a number
const schema = oneOf([stringT(REQUIRED), numberT(REQUIRED)])
```

## anyOf()

Data must be valid against any (one or more) of the given schemas

*typedef*

```ts
export function anyOf(schemas: BaseT[]): {
  validate(v: any, e?: {}): boolean
}
```

*usage*

```js
// object must either contain { str: string } or { num: number } or both
const schema = anyOf([
  objectT({ str: stringT(REQUIRED) }, ADD_PROPS),
  objectT({ num: numberT(REQUIRED) }, ADD_PROPS)
])

schema.validate({}, failure) // false
// failure == {"failures":[{"path":["str"],"message":"not a string"},{"path":["num"],"message":"not a number"}],"message":"anyOf failed"}
schema.validate({ str: '' }) // true

schema.validate({ num: 0 }) // true

schema.validate({ str: '', num: 0 }) // true
```

## allOf()

Data must be valid against all of the given schemas

*typedef*

```ts
export function allOf(schemas: BaseT[]): {
  validate(v: any, e?: {}): boolean
}
```

*usage*

```js
// object must either contain { str: string } and { num: number }
const schema = allOf([
  objectT({ str: stringT().min(3) }).additionalProperties(),
  objectT({ num: numberT().min(0).max(10) }).additionalProperties()
])

schema.validate({}) // true
schema.validate({ str: '' }) // true
schema.validate({ num: 0 }) // true

let failure = {}
schema.validate({ str: 'aaa', num: -1 }, failure)
// false {"message":"allOf failed in schema[1]","failures":[{"path":["num"],"message":"number less than min=0"}]}
```

## toJsonSchema()

A schema can be exported to JSON schema except

- any custom validate functions
- dateT() validator

A conversion from JSON schema is not supported.

*usage*

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
//         str: { type: 'string', minLength: 0, maxLength: 255 }
//       }
//     },
//     bool: { type: 'boolean' }
//   ]
// }
```

## cast()

Casts validated values from schema.

*usage*

```js
import { booleanT, numberT, cast } from '@veloze/validate'

const schema = oneOf([
  booleanT({ cast: true }), 
  numberT({ cast: true })
])
const castValues = cast(schema)

const v = 'false'
// first validate...
const isValid = schema.validate(v)
// ... if `true` then cast
if (isValid) {
  const value = castValues(v)
  // value === false
}
```

Use with own coerce function

*usage*

```js 
class RegExpT extends StringT {
  coerce (v) { // called by cast()
    return new RegExp(v)
  }
}

const schema = new RegExpT().cast()
const v = '^hi'
const isValid = schema.validate(v)
if (isValid) {
  const value = castValues(v)
  // value === /^hi/
}
```


# License

[MIT licensed](./LICENSE)

[npm-badge]: https://badgen.net/npm/v/@veloze/validate
[npm]: https://www.npmjs.com/package/@veloze/validate
[types-badge]: https://badgen.net/npm/types/@veloze/validate
[actions-badge]: https://github.com/commenthol/veloze-validate/workflows/CI/badge.svg?branch=main&event=push
[actions]: https://github.com/commenthol/veloze-validate/actions/workflows/ci.yml?query=branch%3Amain
