import { numberT, stringT, objectT, REQUIRED, ADD_PROPS } from '../src/index.js'

const subschema = {
  num: numberT({ min: 0, max: 100, exclusiveMax: true }),
  str: stringT(REQUIRED)
}
const schema = objectT(subschema, { ...REQUIRED, ...ADD_PROPS, min: 1 })

schema({ str: 'hi', num: 2 }) // true

let failure = {}
schema({}, failure)
console.log(failure)
// failure == { message: 'object has less than 1 properties' }

failure = {}
schema({ str: 1 }, failure)
console.log(failure)
// failure == { path: [ 'str' ], message: 'not a string' }

failure = {}
schema({ str: 'hi', num: 'abc' }, failure)
console.log(failure)
// failure == { path: [ 'num' ], message: 'not a number' }
