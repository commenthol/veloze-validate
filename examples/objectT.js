/* eslint no-console: off */
import {
  numberT,
  stringT,
  objectT,
  REQUIRED,
  ADD_PROPS
} from '../src/index.js'

const subschema = {
  num: numberT({ min: 0, max: 100, exclusiveMax: true }),
  str: stringT(REQUIRED)
}
const schema = objectT(subschema, { ...REQUIRED, ...ADD_PROPS, min: 1 })

schema.validate({ str: 'hi', num: 2 }) // true

let failure = {}
schema.validate({}, failure)
console.log(failure)
// failure == { message: 'object has less than 1 properties' }

failure = {}
schema.validate({ str: 1 }, failure)
console.log(failure)
// failure == { path: [ 'str' ], message: 'not a string' }

failure = {}
schema.validate({ str: 'hi', num: 'abc' }, failure)
console.log(failure)
// failure == { path: [ 'num' ], message: 'not a number' }
