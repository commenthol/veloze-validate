/* eslint no-console: off */
import {
  allOf,
  objectT,
  numberT,
  stringT
} from '../src/index.js'

// object must either contain { str: string } or { num: number } or both
const schema = allOf([
  objectT({ str: stringT().min(3) }).additionalProperties(),
  objectT({ num: numberT().min(0).max(10) }).additionalProperties()
])

let failure = {}
let valid = schema.validate({}, failure)
console.log('%s %j', valid, failure)
// true {}

failure = {}
valid = schema.validate({ str: '' }, failure)
console.log('%s %j', valid, failure)
// true {}

failure = {}
valid = schema.validate({ num: 0 }, failure)
console.log('%s %j', valid, failure)
// true {}

failure = {}
valid = schema.validate({ str: 'aa', num: -1 }, failure)
console.log('%s %j', valid, failure)
// false {"message":"allOf failed in schema[0]","failures":[{"path":["str"],"message":"string too short min=3"}]}

failure = {}
valid = schema.validate({ str: 'aaa', num: -1 }, failure)
console.log('%s %j', valid, failure)
// false {"message":"allOf failed in schema[1]","failures":[{"path":["num"],"message":"number less than min=0"}]}
