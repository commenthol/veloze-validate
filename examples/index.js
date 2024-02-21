/* eslint no-console: off */
import {
  booleanT,
  numberT,
  integerT,
  stringT,
  arrayT,
  objectT,
  oneOf,
  allOf
} from '../src/index.js'

const schema = objectT({
  bool: booleanT(), // optional boolean
  num: numberT().min(-1).max(10), // optional number [-1..10]
  int: integerT().min(0).max(10), // optional integer [0,1,..10]
  str: stringT(), // optional string
  arr: arrayT(oneOf([stringT(), integerT()])), // optional array of string or integers
  obj: objectT({
    // required nested object with
    nested: stringT() // optional string
  }).required(),
  all: allOf([
    // either or both
    objectT({ flag: booleanT() }).additionalProperties(),
    objectT({ test: integerT() }).additionalProperties()
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
