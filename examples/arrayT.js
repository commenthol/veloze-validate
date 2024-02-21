/* eslint no-console: off */
import { numberT, arrayT, REQUIRED } from '../src/index.js'

const subschema = numberT({ min: 0, max: 100, exclusiveMax: true })
const schema = arrayT(subschema, { ...REQUIRED, min: 2, max: 10 })

schema.validate([0, 55, 12]) // true

const failure = {}
schema.validate([4, -2, 4], failure)
console.log(failure) // false { message: 'number less than min=0', path: [ '1' ] }
