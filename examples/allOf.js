/* eslint no-console: off */
import { t } from '../src/index.js'

// object must either contain { str: string } or { num: number } or both
const schema = t.allOf([
  t.object({ str: t.string().min(3) }).additionalProperties(),
  t.object({ num: t.number().min(0).max(10) }).additionalProperties()
])

let e = {}
let valid = schema.validate({}, e)
console.log('%s %j', valid, e)
// true {}

e = {}
valid = schema.validate({ str: '' }, e)
console.log('%s %j', valid, e)
// true {}

e = {}
valid = schema.validate({ num: 0 }, e)
console.log('%s %j', valid, e)
// true {}

e = {}
valid = schema.validate({ str: 'aa', num: -1 }, e)
console.log('%s %j', valid, e)
// false {"message":"allOf failed in schema[0]","failures":[{"path":["str"],"message":"string too short min=3"}]}

e = {}
valid = schema.validate({ str: 'aaa', num: -1 }, e)
console.log('%s %j', valid, e)
// false {"message":"allOf failed in schema[1]","failures":[{"path":["num"],"message":"number less than min=0"}]}
