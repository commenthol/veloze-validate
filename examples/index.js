import {
  booleanT,
  numberT,
  integerT,
  stringT,
  arrayT,
  objectT,
  oneOf,
  allOf,
  REQUIRED, // == { required: true }
  ADD_PROPS // == { additionalProperties: true }
} from '../src/index.js'

const schema = objectT(
  {
    bool: booleanT(), // optional boolean
    num: numberT({ min: -1, max: 10 }), // optional number [-1..10[
    int: integerT({ min: 0, max: 10 }), // optional integer [0,1,..9]
    str: stringT(), // optional string
    arr: arrayT(oneOf([stringT(), integerT()])), // optional array of string or integers
    obj: objectT(
      {
        // required nested object with
        nested: stringT() // optional string
      },
      REQUIRED
    ),
    any: allOf([ // either or both
      objectT({ flag: booleanT() }, ADD_PROPS),
      objectT({ test: integerT() }, ADD_PROPS)
    ])
  },
  { ...REQUIRED, additionalProperties: true }
)

let e = {}
let valid = schema({ obj: {}, other: true }, e)
console.log(valid, e) // true {}

e = {}
valid = schema({ bool: true, num: '123' }, e)
console.log(valid, e) // false { message: 'not a number', path: [ 'num' ] }

e = {}
valid = schema({ arr: ['a', 1, 1.2] }, e)
console.log(valid, e)
// false { path: [ 'arr', '2' ], message: 'oneOf failed, matches 0 schemas' }

e = {}
valid = schema({ any: { flag: true, test: '1' }, obj: {} }, e)
console.log('%s %j', valid, e)
// false {"path":["any"],"failures":[{"path":["test"],"message":"not a number"}],"message":"allOf failed"}
