/* eslint no-console: off */
import { t, cast } from '../src/index.js'

// default to a static value
const schema = t.string().default('hi_world')
const castValues = cast(schema)
console.log(schema.validate(), castValues())
// true hi_world

// default to a dynamic value
const schemaDyn = t.string().default(() => Math.random().toString(36).slice(2))
const castValuesDyn = cast(schemaDyn)
console.log(schemaDyn.validate(), castValuesDyn())
// true la7rqqds4o
