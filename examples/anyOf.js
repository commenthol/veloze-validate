import {
  anyOf,
  REQUIRED,
  ADD_PROPS,
  objectT,
  numberT,
  stringT
} from '../src/index.js'

// object must either contain { str: string } or { num: number } or both
const schema = anyOf([
  objectT({ str: stringT(REQUIRED) }, ADD_PROPS),
  objectT({ num: numberT(REQUIRED) }, ADD_PROPS)
])

let failure = {}
let valid = schema.validate({}, failure)
console.log('%s %j', valid, failure)
// false {"failures":[{"path":["str"],"message":"not a string"},{"path":["num"],"message":"not a number"}],"message":"anyOf failed"}

failure = {}
valid = schema.validate({ str: '' }, failure)
console.log('%s %j', valid, failure)
// true {}

failure = {}
valid = schema.validate({ num: 0 }, failure)
console.log('%s %j', valid, failure)
// true {}

failure = {}
valid = schema.validate({ str: '', num: 0 }, failure)
console.log('%s %j', valid, failure)
// true {}
