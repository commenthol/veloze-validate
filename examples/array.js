/* eslint no-console: off */
import { t, REQUIRED } from '../src/index.js'

const subschema = t.number({ min: 0, max: 100, exclusiveMax: true })
const schema = t.array(subschema, { ...REQUIRED, min: 2, max: 10 })

let e = {}
console.log(schema.validate([0, 55, 12], e), e) // true {}

e = {}
console.log(schema.validate([4, -2, 4], e), e) // false { message: 'number less than min=0', path: [ '1' ] }
