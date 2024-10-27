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
  ValidationError,
  BooleanT,
  NumberT,
  IntegerT,
  DateT,
  StringT,
  EnumT,
  ArrayT,
  ObjectT,
  OneOf,
  AnyOf,
  AllOf,
  instanceT,
  InstanceT
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
      equal(booleanT().required().analyze(true), null)
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

    it('shall clone', function () {
      const schema = booleanT()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof BooleanT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
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

    it('shall clone', function () {
      const schema = numberT()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof NumberT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
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

    it('shall clone', function () {
      const schema = integerT()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof IntegerT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
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

    it('shall clone', function () {
      const schema = dateT()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof DateT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
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

    it('shall clone', function () {
      const schema = stringT()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof StringT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
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

    it('shall clone', function () {
      const schema = enumT([1, 2])
      const clone = schema.clone().cast()
      assert.ok(clone instanceof EnumT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
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

    it('shall clone', function () {
      const schema = arrayT(stringT())
      const clone = schema.clone().cast()
      assert.ok(clone instanceof ArrayT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
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

    it('shall clone', function () {
      const schema = objectT(stringT())
      const clone = schema.clone().cast()
      assert.ok(clone instanceof ObjectT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })
  })

  describe('instanceT', function () {
    it('shall validate', function () {
      const schema = instanceT(String)

      equal(schema.validate(new String('string')), true)

      const e = {}

      equal(schema.validate(new Number(7), e), false)
      equal(e.message, 'not an instance of String')
    })

    it('is not required', function () {
      const schema = instanceT(String)
      const err = schema.analyze()
      equal(err, null)
    })

    it('shall clone', function () {
      const schema = instanceT(Number)
      const clone = schema.clone().cast()
      assert.ok(clone instanceof InstanceT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })

    it('custom validation', function () {
      const schema = instanceT(Number).custom((v) => v === 7)

      const err = schema.analyze(new Number(42))
      equal(err.message, 'instance validate failed')
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

    it('shall clone', function () {
      const schema = oneOf([numberT(), stringT()])
      const clone = schema.clone()
      assert.ok(clone instanceof OneOf)
      assert.notEqual(clone, schema)
    })

    it('optional value', function () {
      const schema = oneOf([stringT(), numberT()])
      const err = schema.analyze()
      equal(err, null)
    })

    it('requires a value', function () {
      const schema = oneOf([stringT(), numberT()]).required()
      const err = schema.analyze()
      equal(err.message, 'oneOf failed, matches 2 schemas')
    })

    it('requires at least a number', function () {
      const schema = oneOf([stringT(), numberT().required()])
      const err = schema.analyze()
      equal(err.message, 'oneOf failed, number required')
    })

    it('fails with custom validation', function () {
      const schema = oneOf([stringT(), numberT()]).custom((v) => {
        return v === 3
      })
      const err = schema.analyze(1)
      equal(err.message, 'oneOf validate failed')
    })

    it('ok with custom validation', function () {
      const schema = oneOf([stringT(), numberT()]).custom((v) => {
        return v === 3
      })
      const err = schema.analyze(3)
      equal(err, null)
    })

    it('string or array of strings', function () {
      const schema = oneOf([arrayT(stringT()), stringT()])
      equal(schema.validate('one'), true)
      equal(schema.validate(['one', 'two']), true)
      equal(schema.validate(1), false)
      equal(schema.validate([1, 'two']), false)
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

    it('shall clone', function () {
      const schema = anyOf([numberT(), stringT()])
      const clone = schema.clone()
      assert.ok(clone instanceof AnyOf)
      assert.notEqual(clone, schema)
    })

    it('fails with custom validation', function () {
      const schema = anyOf([stringT(), numberT()]).custom((v) => {
        return v === 3
      })
      const err = schema.analyze(1)
      equal(err.message, 'anyOf validate failed')
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

    it('shall clone', function () {
      const schema = allOf([numberT(), stringT()])
      const clone = schema.clone()
      assert.ok(clone instanceof AllOf)
      assert.notEqual(clone, schema)
    })

    it('fails with custom validation', function () {
      const schema = allOf([
        objectT({ a: integerT().min(3) }).additionalProperties(),
        objectT({ b: integerT().min(5) }).additionalProperties()
      ]).custom((v) => {
        return v.a === 3
      })
      const err = schema.analyze({ a: 4, b: 7 })
      equal(err.message, 'allOf validate failed')
    })
  })
  describe('ValidationError', function () {
    it('shall set message', function () {
      const err = new ValidationError()
      equal(err.message, 'validation failed')
    })

    it('shall set message and path', function () {
      const err = new ValidationError({ message: 'not a string', path: '/' })
      equal(err.message, 'not a string')
      equal(err.path, '/')
    })

    it('schema.throws()', function () {
      const schema = stringT().required()
      try {
        schema.throws(3.14)
        throw new Error()
      } catch (e) {
        assert.deepEqual(e, new ValidationError({ message: 'not a string' }))
      }
    })
  })
})
