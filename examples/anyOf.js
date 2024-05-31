/* eslint no-console: off */
import { t } from '../src/index.js'

// object must either contain { str: string } or { num: number } or both
const schema = t.anyOf([
  t.object({ str: t.string().required() }).additionalProperties(),
  t.object({ num: t.number().required() }).additionalProperties()
])

let e = {}
let valid = schema.validate({}, e)
console.log('%s %j', valid, e)
// false {"failures":[{"path":["str"],"message":"not a string"},{"path":["num"],"message":"not a number"}],"message":"anyOf failed"}

e = {}
valid = schema.validate({ str: '' }, e)
console.log('%s %j', valid, e)
// true {}

e = {}
valid = schema.validate({ num: 0 }, e)
console.log('%s %j', valid, e)
// true {}

e = {}
valid = schema.validate({ str: '', num: 0 }, e)
console.log('%s %j', valid, e)
// true {}
