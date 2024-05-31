/* eslint no-console: off */
import { t } from '../src/index.js'

const subschema = {
  num: t.number({ min: 0, max: 100, exclusiveMax: true }),
  str: t.string().required()
}
const schema = t.object(subschema, { min: 1, required: true, additionalProperties: true })

schema.validate({ str: 'hi', num: 2 }) // true

let e = {}
console.log(schema.validate({ num: 100 - 1e-12, str: 'hi', test: 0 }, e), e)
// true { path: [], additionalProps: [ [ 'test' ] ] }

e = {}
console.log(schema.validate({}, e), e)
// false { message: 'object has less than 1 properties' }

e = {}
console.log(schema.validate({ str: 1 }, e), e)
// false { path: [ 'str' ], message: 'not a string' }

e = {}
console.log(schema.validate({ str: 'hi', num: 'abc' }, e), e)
// false { path: [ 'num' ], message: 'not a number' }
