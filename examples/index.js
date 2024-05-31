/* eslint no-console: off */
import { t } from '../src/index.js'

const schema = t.object({
  bool: t.boolean(), // optional boolean
  num: t.number().min(-1).max(10), // optional number [-1..10]
  int: t.integer().min(0).max(10), // optional integer [0,1,..10]
  str: t.string(), // optional string
  arr: t.array(t.oneOf([t.string(), t.integer()])), // optional array of string or integers
  obj: t.object({
    // required nested object with
    nested: t.string() // optional string
  }).required(),
  all: t.allOf([
    // either or both
    t.object({ flag: t.boolean() }).additionalProperties(),
    t.object({ test: t.integer() }).additionalProperties()
  ])
})
  .required()
  .additionalProperties()

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
valid = schema.validate({ all: { flag: true, test: 'a1' }, obj: {} }, e)
console.log('%s %j', valid, e)
// false {"path":["any"],"failures":[{"path":["test"],"message":"not a number"}],"message":"allOf failed"}

// now with an additional custom validation
const schemaCustom = schema.clone().custom((v, e) => {
  // custom validation
  if (v.bool && v.str !== 'hi') {
    e.message = 'if bool is true then str must equal "hi"'
    return false
  }
  return true
})
const err = schemaCustom.analyze({ bool: true, str: 'hello', obj: {} })
console.log(err)
// ValidationError: if bool is true then str must equal "hi"

e = {}
console.log(t.instance(Uint16Array).validate('a', e), e)
// false { message: 'not an instance of Uint16Array' }
