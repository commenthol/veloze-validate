import {
  allOf,
  REQUIRED,
  ADD_PROPS,
  objectT,
  numberT,
  stringT
} from '../src/index.js'

// object must either contain { str: string } or { num: number } or both
const schema = allOf([
  objectT({ str: stringT(REQUIRED) }, ADD_PROPS),
  objectT({ num: numberT(REQUIRED) }, ADD_PROPS)
])

let failure = {}
let valid = schema({}, failure)
console.log('%s %j', valid, failure)
// false {"failures":[{"path":["str"],"message":"not a string"}],"message":"allOf failed"}

failure = {}
valid = schema({ str: '' }, failure)
console.log('%s %j', valid, failure)
// false {"failures":[{"path":["str"],"message":"not a string"}],"message":"allOf failed"}

failure = {}
valid = schema({ num: 0 }, failure)
console.log('%s %j', valid, failure)
// false {"failures":[{"path":["str"],"message":"not a string"}],"message":"allOf failed"}

failure = {}
valid = schema({ str: '', num: 0 }, failure)
console.log('%s %j', valid, failure)
// true {}
