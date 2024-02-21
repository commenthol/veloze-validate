/* eslint no-console: off */
import { stringT, cast } from '../src/index.js'

// default to a static value
const schema = stringT().default('4h8pxby0w77')
const castValues = cast(schema)
console.log(schema.validate(), castValues())
// true 4h8pxby0w77

// default to a dynamic value
const schemaDyn = stringT().default(() => Math.random().toString(36).slice(2))
const castValuesDyn = cast(schemaDyn)
console.log(schemaDyn.validate(), castValuesDyn())
// true la7rqqds4o
