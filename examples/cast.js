/* eslint no-console: off */
import { booleanT, numberT, oneOf, cast } from '../src/index.js'

const schema = oneOf([
  booleanT({ cast: true }),
  numberT({ cast: true })
])
const castValues = cast(schema)

const v = 'false'
// first validate...
const isValid = schema.validate(v)
console.log(isValid)
// ... if `true` then cast
if (isValid) {
  const value = castValues(v)
  console.log(value)
  // value === false
}
