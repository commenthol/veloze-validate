import assert, { equal, deepEqual } from 'assert/strict'
import {
  booleanT,
  numberT,
  integerT,
  stringT,
  dateT,
  enumT,
  arrayT,
  objectT,
  REQUIRED,
  ADD_PROPS,
  oneOf,
  anyOf,
  allOf,
  not,
  ValidationError
} from '../src/index.js'

describe('validate', function () {
  describe('REQUIRED', function () {
    it('shall not not extensible', function () {
      assert.throws(() => {
        REQUIRED.test = 1
      }, /object is not extensible/)
    })
  })

  describe('booleanT', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        booleanT().default('true')
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not a boolean')
      }
    })

    it('boolean validations', function () {
      const e = {}
      equal(booleanT(REQUIRED).validate(undefined, e), false)
      equal(e.message, 'not a boolean')
      equal(booleanT().validate(), true)
      equal(booleanT(REQUIRED).validate(true), true)
      equal(booleanT(REQUIRED).validate(false), true)
    })

    it('booleanT().analyze()', function () {
      deepEqual(
        booleanT().required().analyze('true'),
        new ValidationError({ message: 'not a boolean' })
      )
      equal(
        booleanT().required().analyze(true),
        null
      )
    })

    it('cast boolean from string', function () {
      equal(booleanT({ cast: true }).validate('true'), true)
      equal(booleanT({ cast: true }).validate('false'), true)
      equal(booleanT({ cast: true }).validate('string'), false)
      equal(booleanT({ cast: true }).validate(true), true)
      equal(booleanT({ cast: true }).validate(false), true)
    })

    it('custom validate', function () {
      const schema = booleanT({ validate: (v) => v === true })
      const e = {}
      equal(schema.validate(false, e), false)
      deepEqual(e, { message: 'boolean validate failed' })
      equal(schema.validate(true), true)
    })
  })

  describe('numberT', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        numberT().default(true)
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not a number')
      }
    })

    it('fails if min is greater max', function () {
      assert.throws(() => {
        numberT({ min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('number validations', function () {
      let e = {}
      equal(numberT(REQUIRED).validate(undefined, e), false)
      equal(e.message, 'not a number')
      equal(numberT().validate(), true)

      equal(numberT().validate(1), true)
      equal(numberT().validate(1.23), true)
      equal(numberT().validate(-1), true)

      e = {}
      equal(numberT({ min: 0 }).validate(1, e), true)
      equal(numberT().min(0).validate(-1, e), false)
      equal(e.message, 'number less than min=0')

      e = {}
      equal(numberT({ min: 0, exclusiveMin: true }).validate(1, e), true)
      equal(numberT().min(0).exclusiveMin().validate(0, e), false)
      equal(e.message, 'number less equal than min=0')

      e = {}
      equal(numberT({ max: 0 }).validate(-1, e), true)
      equal(numberT().max(0).validate(1, e), false)
      equal(e.message, 'number greater than max=0')

      e = {}
      equal(numberT({ max: 0, exclusiveMax: true }).validate(-1, e), true)
      equal(numberT().max(0).exclusiveMax().validate(0, e), false)
      equal(e.message, 'number greater equal than max=0')

      e = {}
      equal(numberT().validate(true, e), false)
      equal(e.message, 'not a number')
      equal(numberT().validate('1.23'), false)
      equal(numberT().validate(null), false)
    })

    it('numberT().analyze()', function () {
      deepEqual(
        numberT().max(0).exclusiveMax().analyze(0),
        new ValidationError({ message: 'number greater equal than max=0' })
      )
    })

    it('cast number from string', function () {
      equal(numberT({ cast: true }).validate('12'), true)
      equal(numberT({ cast: true }).validate('-3.14'), true)
      equal(numberT({ cast: true }).validate('string'), false)
      equal(numberT({ cast: true }).validate([]), false)
      equal(numberT({ cast: true }).validate({}), false)
      equal(numberT({ cast: true }).validate(true), false)
      equal(numberT({ cast: true }).validate(false), false)
    })

    it('custom validate', function () {
      const schema = numberT({ validate: (v) => v === 5 })
      equal(schema.validate(4), false)
      equal(schema.validate(5), true)
      equal(schema.validate('5'), false)
    })

    it('custom validate 2', function () {
      const schema = numberT().custom((v) => v === 5)
      equal(schema.validate(4), false)
      equal(schema.validate(5), true)
      equal(schema.validate('5'), false)
    })
  })

  describe('integerT', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        integerT().default(1.2)
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not an integer')
      }
    })

    it('integer validations', function () {
      let e = {}
      equal(integerT(REQUIRED).validate(undefined, e), false)
      equal(e.message, 'not a number')
      equal(integerT().validate(), true)

      e = {}
      equal(integerT().validate(1, e), true)
      equal(integerT().validate(1.23, e), false)
      equal(e.message, 'not an integer')
      equal(integerT().validate(-1), true)

      equal(integerT({ min: 0 }).validate(1), true)
      equal(integerT({ min: 0 }).validate(-1), false)

      equal(integerT({ max: 0 }).validate(-1), true)
      equal(integerT({ max: 0 }).validate(1), false)

      equal(integerT().validate(true), false)
      equal(integerT().validate('1.23'), false)
      equal(integerT().validate(null), false)
    })

    it('integerT().analyze()', function () {
      deepEqual(
        integerT().max(0).exclusiveMax().analyze(-0.1),
        new ValidationError({ message: 'not an integer' })
      )
    })
  })

  describe('dateT', function () {
    it('fails if min is greater max', function () {
      assert.throws(() => {
        dateT({ min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('fails if min is not a date', function () {
      assert.throws(
        () => {
          dateT({ min: 'abc' })
        },
        {
          message: 'min is not a date'
        }
      )
    })

    it('fails if max is not a date', function () {
      assert.throws(
        () => {
          dateT({ max: 'abc' })
        },
        {
          name: 'TypeError',
          message: 'max is not a date'
        }
      )
    })

    it('date validation', function () {
      equal(dateT(REQUIRED).validate(), false)
      equal(dateT().required().validate(new Date()), true)
      equal(dateT({ ...REQUIRED, min: 1 }).validate(''), false)
      equal(dateT().validate(), true)

      equal(dateT({ min: 2 }).validate(new Date()), true)
      let e = {}
      equal(dateT().min(2).validate(new Date(0), e), false)
      equal(e.message, 'date less than min=1970-01-01T00:00:00.002Z')

      equal(dateT({ min: 2, exclusiveMin: true }).validate(new Date()), true)
      e = {}
      equal(dateT().min(2).exclusiveMin().validate(new Date(2), e), false)
      equal(e.message, 'date less equal than min=1970-01-01T00:00:00.002Z')

      equal(dateT({ max: 2 }).validate(new Date(0)), true)
      e = {}
      equal(dateT({ max: 2 }).validate(new Date(), e), false)
      equal(e.message, 'date greater than max=1970-01-01T00:00:00.002Z')
      e = {}
      equal(
        dateT({ max: 2, exclusiveMax: true }).validate(new Date(2), e),
        false
      )
      equal(e.message, 'date greater equal than max=1970-01-01T00:00:00.002Z')
      equal(dateT().max(2).exclusiveMax().validate(new Date(2)), false)

      equal(dateT().validate(true), false)
      equal(dateT().validate(1.23), false)
      equal(dateT().validate(null), false)
    })

    it('dateT().analyze()', function () {
      deepEqual(
        dateT({ max: 2, exclusiveMax: true }).analyze(new Date(2)),
        new ValidationError({
          message: 'date greater equal than max=1970-01-01T00:00:00.002Z'
        })
      )
    })

    it('custom validation', function () {
      const schema = dateT({
        validate: (v) => v.toISOString() === new Date(0).toISOString()
      })
      equal(schema.validate(new Date(0)), true)
      const e = {}
      equal(schema.validate(new Date(1e3), e), false)
      equal(e.message, 'date validate failed')
    })
  })

  describe('stringT', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        stringT().default(1.2)
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not a string')
      }
    })

    it('fails if min is greater max', function () {
      assert.throws(() => {
        stringT({ min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('fails if pattern is not a regex', function () {
      assert.throws(() => {
        stringT({ pattern: 'test' })
      }, /TypeError: pattern not a regex/)
      assert.throws(() => {
        stringT().pattern('test')
      }, /TypeError: pattern not a regex/)
    })

    it('string validation', function () {
      equal(stringT(REQUIRED).validate(), false)
      equal(stringT().required().validate(''), true)
      equal(stringT({ ...REQUIRED, min: 1 }).validate(''), false)
      equal(stringT().validate(''), true)
      equal(stringT().validate(), true)
      equal(stringT({ min: 5 }).validate(''), true)

      equal(stringT().validate('a'), true)
      equal(stringT().validate('1.23'), true)

      equal(stringT({ min: 2 }).validate('aaa'), true)
      equal(stringT().min(2).validate('aa'), true)
      equal(stringT({ min: 2 }).validate('a'), false)

      equal(stringT({ max: 2 }).validate('a'), true)
      equal(stringT().max(2).validate('aa'), true)
      equal(stringT({ max: 2 }).validate('aaaa'), false)

      equal(stringT({ pattern: /ab/ }).validate('aaba'), true)
      const e = {}
      equal(stringT().pattern(/ab/).validate('aaaa', e), false)
      equal(e.message, 'string does not match pattern=ab')

      equal(stringT().validate(true), false)
      equal(stringT().validate(1.23), false)
      equal(stringT().validate(null), false)
    })

    it('custom validation', function () {
      const schema = stringT({ validate: (v) => v === 'str' })
      equal(schema.validate('str'), true)
      const e = {}
      equal(schema.validate('not', e), false)
      equal(e.message, 'string validate failed')
    })

    it('url validation', function () {
      equal(stringT().url().validate('https://foo.bar/path?a=1?b=2'), true)
      const e = {}
      equal(stringT().url().validate('/foo.bar/path', e), false)
      deepEqual(e, { message: 'string is not an url' })
    })

    it('date validation', function () {
      equal(stringT().dateTime().validate('2020-12-01'), true)
      const e = {}
      equal(stringT().dateTime().validate('/foo.bar/path', e), false)
      deepEqual(e, { message: 'string is not a date-time' })
    })

    it('uuid validation', function () {
      equal(
        stringT().uuid().validate('641663d3-4689-4ab0-842d-11fe8bfcfb17'),
        true
      )
      const e = {}
      equal(
        stringT().uuid().validate('641663d3-4689-4ab0-842x-11fe8bfcfb17', e),
        false
      )
      deepEqual(e, { message: 'string is not an uuid' })
    })
  })

  describe('enumT', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        enumT([1, 2, 3]).default(4)
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not an enum value')
      }
    })

    it('fails if list is not an array', function () {
      assert.throws(() => {
        enumT(123)
      }, /TypeError: array expected/)
    })

    it('enum validation', function () {
      equal(enumT([1], REQUIRED).validate(), false)
      equal(enumT([1]).validate(), true)

      equal(enumT([1]).validate(1), true)
      const e = {}
      equal(enumT([1]).validate(2, e), false)
      equal(e.message, 'not an enum value')

      equal(enumT([1]).validate(true), false)
      equal(enumT([1]).validate(1.23), false)
      equal(enumT([1]).validate(null), false)
    })
  })

  describe('arrayT', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        arrayT(numberT().min(0).max(10)).default([11])
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: number greater than max=10')
      }
    })

    it('fails if min is greater max', function () {
      assert.throws(() => {
        arrayT(numberT(), { min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('fails if type is not a function', function () {
      assert.throws(
        () => {
          arrayT(123)
        },
        {
          name: 'TypeError',
          message: 'schema expected'
        }
      )
    })

    it('array validations', function () {
      equal(arrayT(numberT(), REQUIRED).validate(), false)
      equal(arrayT(numberT(), REQUIRED).validate([]), true)
      equal(arrayT(numberT()).validate(), true)
      equal(arrayT(numberT()).validate([]), true)

      equal(arrayT(integerT()).validate([1, 2, 3]), true)
      let e = {}
      equal(arrayT(integerT()).validate([1, 2.1, 3], e), false)
      deepEqual(e, { message: 'not an integer', path: ['1'] })

      e = {}
      equal(arrayT(integerT({ min: 2 })).validate([1, 2, 3], e), false)
      deepEqual(e, { message: 'number less than min=2', path: ['0'] })

      equal(arrayT(integerT({ max: 2 })).validate([1, 2, 3]), false)
      equal(arrayT(integerT({ max: 2 })).validate([0, 1]), true)

      e = {}
      equal(arrayT(integerT(), { max: 2 }).validate([1, 2, 3], e), false)
      deepEqual(e, { message: 'array too long max=2' })

      e = {}
      equal(arrayT(integerT(), { min: 2 }).validate([1], e), false)
      deepEqual(e, { message: 'array too short min=2' })
    })

    it('custom validation', function () {
      const schema = arrayT(stringT(), { validate: (v) => v[1] === '1' })
      equal(schema.validate(['a', '1', 'c']), true)
      const e = {}
      equal(schema.validate(['a', 'b', 'c'], e), false)
      equal(e.message, 'array validate failed')
    })
  })

  describe('objectT', function () {
    it('fails if schema is not an object function', function () {
      assert.throws(() => {
        objectT(123)
      }, /TypeError: schema object expected/)
    })

    it('fails if min is greater max', function () {
      assert.throws(() => {
        objectT({}, { min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('shall throw if default() has not correct type', function () {
      try {
        objectT({
          bool: booleanT()
        }).default({ bool: 'foo' })
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not a boolean')
      }
    })

    it('object validation', function () {
      equal(objectT({}).validate(), true)
      equal(objectT({}, REQUIRED).validate(), false)
      equal(objectT({}).validate(null), true)
      equal(objectT({}, REQUIRED).validate(null), false)
    })

    it('minProperties maxProperties', function () {
      let e = {}
      equal(
        objectT({}, { ...ADD_PROPS, min: 2 }).validate({ a: 1, b: 2 }, e),
        true
      )
      deepEqual(e, {
        additionalProps: [['a'], ['b']],
        path: []
      })
      e = {}
      equal(objectT({}, { ...ADD_PROPS, min: 2 }).validate({ a: 1 }, e), false)
      deepEqual(e, {
        message: 'object has less than 2 properties'
      })
      e = {}
      equal(
        objectT({}, { ...ADD_PROPS, max: 2 }).validate({ a: 1, b: 2 }, e),
        true
      )
      deepEqual(e, {
        additionalProps: [['a'], ['b']],
        path: []
      })
      e = {}
      equal(
        objectT({}, { ...ADD_PROPS, max: 2 }).validate({ a: 1, b: 2, c: 3 }, e),
        false
      )
      deepEqual(e, {
        message: 'object has more than 2 properties'
      })
    })

    let schema
    before(function () {
      schema = {
        bool: booleanT(),
        num: numberT(),
        int: integerT(),
        str: stringT(REQUIRED),
        arr: arrayT(numberT()),
        obj: objectT(
          {
            nested: integerT()
          },
          ADD_PROPS
        )
      }
    })

    it('valid', function () {
      const v = {
        bool: true,
        num: 3.14,
        int: 1,
        str: 'string',
        arr: [1, 2.3],
        obj: {
          nested: 7
        }
      }
      equal(objectT(schema).validate(v), true)
    })

    it('invalid bool', function () {
      const v = {
        bool: 1,
        num: 3.14,
        int: 1,
        str: 'string',
        arr: [1, 2.3],
        obj: {
          nested: 7
        }
      }
      const e = {}
      equal(objectT(schema).validate(v, e), false)
      deepEqual(e, {
        message: 'not a boolean',
        path: ['bool']
      })
    })

    it('invalid array', function () {
      const v = {
        bool: false,
        num: 3.14,
        int: 1,
        str: 'string',
        arr: [1, '2.3'],
        obj: {
          nested: 7
        }
      }
      const e = {}
      equal(objectT(schema).validate(v, e), false)
      deepEqual(e, {
        message: 'not a number',
        path: ['arr', '1']
      })
    })

    it('invalid nested obj', function () {
      const v = {
        bool: false,
        num: 3.14,
        int: 1,
        str: 'string',
        arr: [1, 2.3],
        obj: {
          nested: '7'
        }
      }
      const e = {}
      equal(objectT(schema).validate(v, e), false)
      deepEqual(e, {
        message: 'not a number',
        path: ['obj', 'nested']
      })
    })

    it('missing prop', function () {
      const v = {
        bool: false,
        num: 3.14,
        int: 1,
        arr: [1, 2.3],
        obj: {
          nested: 7
        }
      }
      const e = {}
      equal(objectT(schema).validate(v, e), false)
      deepEqual(e, {
        message: 'object has missing key=str'
      })
    })

    it('missing optional prop', function () {
      const v = {
        bool: false,
        num: 3.14,
        int: 1,
        arr: [1, 2.3],
        obj: {
          nested: 7
        }
      }
      const e = {}
      const _schema = { ...schema, str: stringT({ required: false }) }
      equal(objectT(_schema).validate(v, e), true)
      equal(e.message, undefined)
    })

    it('invalid additional props', function () {
      const v = {
        bool: false,
        num: 3.14,
        int: 1,
        str: 'works',
        other: 'xx',
        arr: [1, 2.3],
        obj: {
          nested: 7
        }
      }
      const e = {}
      equal(objectT(schema).validate(v, e), false)
      deepEqual(e, { message: 'object has additional key=other', path: [] })
    })

    it('additional props allowed', function () {
      const v = {
        bool: false,
        num: 3.14,
        int: 1,
        str: 'works',
        other: 'xx',
        arr: [1, 2.3],
        obj: {
          nested: 7,
          test: 'foo'
        }
      }
      const e = {}
      equal(objectT(schema).additionalProperties().validate(v, e), true)
      deepEqual(e, {
        additionalProps: [['obj', 'test'], ['other']],
        path: []
      })
    })

    it('validate fn', function () {
      // if `flag` === true then `test` must be 1
      const schema = objectT(
        {
          flag: booleanT(REQUIRED),
          test: numberT()
        },
        {
          validate: (v) =>
            v.test === undefined || (v.flag === true && v.test === 1)
        }
      )
      equal(schema.validate({ flag: false }), true)
      const e = {}
      equal(schema.validate({ flag: false, test: 1 }, e), false)
      equal(e.message, 'object validate failed')
      equal(schema.validate({ flag: true, test: 1 }), true)
    })
  })

  describe('oneOf', function () {
    it('fails if schema is not an array', function () {
      assert.throws(() => {
        oneOf(123)
      }, /TypeError: schema array expected/)
    })

    it('string or number', function () {
      const schema = oneOf([numberT(), stringT()])

      equal(schema.validate(1), true)
      equal(schema.validate('1'), true)
      const e = {}
      equal(schema.validate(true, e), false)
      deepEqual(e, { message: 'oneOf failed, matches 0 schemas' })
    })

    it('objects', function () {
      const schema = oneOf([
        // if flag === false then msg must be empty string
        objectT({
          flag: booleanT({ required: true, validate: (v) => !v }),
          msg: stringT({ required: true, min: 0, max: 0 })
        }),
        // otherwise msg must be at least 2 chars long
        objectT({
          flag: booleanT({ required: true, validate: (v) => v }),
          msg: stringT({ required: true, min: 2 })
        })
      ])

      equal(schema.validate({ flag: false, msg: '' }), true)
      equal(schema.validate({ flag: true, msg: 'hi' }), true)
      const e = {}
      equal(schema.validate({ flag: true, msg: '' }, e), false)
      deepEqual(e, { message: 'oneOf failed, matches 0 schemas' })
    })
  })

  describe('anyOf', function () {
    it('fails if schema is not an array', function () {
      assert.throws(() => {
        anyOf(123)
      }, /TypeError: schema array expected/)
    })

    it('string or number', function () {
      const schema = anyOf([numberT(), stringT()])

      equal(schema.validate(1), true)
      equal(schema.validate('1'), true)
      const e = {}
      equal(schema.validate(true, e), false)
      deepEqual(e, {
        failures: [
          { message: 'not a number', path: [] },
          { message: 'not a string', path: [] }
        ],
        message: 'anyOf failed'
      })
    })
  })

  describe('allOf', function () {
    it('fails if schema is not an array', function () {
      assert.throws(() => {
        allOf(123)
      }, /TypeError: schema array expected/)
    })

    it('a or b', function () {
      const schema = allOf([
        objectT({ a: stringT().min(3) }).additionalProperties(),
        objectT({ b: stringT().min(5) }).additionalProperties()
      ])

      equal(schema.validate({ a: 'test' }), true)
      equal(schema.validate({ b: 'testall' }), true)
      const e = {}
      equal(schema.validate({ a: 'test', b: 'test' }, e), false)
      deepEqual(e, {
        failures: [
          {
            message: 'string too short min=5',
            path: ['b']
          }
        ],
        message: 'allOf failed in schema[1]'
      })
    })
  })
  describe('not', function () {
    it('not supported', function () {
      assert.throws(() => {
        not(booleanT())
      })
    })
  })
})
