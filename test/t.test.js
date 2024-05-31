import assert, { equal, deepEqual } from 'assert/strict'
import {
  t,
  ValidationError,
  REQUIRED,
  ADD_PROPS,
  BooleanT,
  NumberT,
  IntegerT,
  DateT,
  StringT,
  EnumT,
  ArrayT,
  ObjectT,
  InstanceT,
  OneOf,
  AnyOf,
  AllOf
} from '../src/index.js'

describe('t', function () {
  describe('t.boolean', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        t.boolean().default('true')
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not a boolean')
      }
    })

    it('boolean validations', function () {
      const e = {}
      equal(t.boolean(REQUIRED).validate(undefined, e), false)
      equal(e.message, 'not a boolean')
      equal(t.boolean().validate(), true)
      equal(t.boolean(REQUIRED).validate(true), true)
      equal(t.boolean(REQUIRED).validate(false), true)
    })

    it('t.boolean().analyze()', function () {
      deepEqual(
        t.boolean().required().analyze('true'),
        new ValidationError({ message: 'not a boolean' })
      )
      equal(t.boolean().required().analyze(true), null)
    })

    it('cast boolean from string', function () {
      equal(t.boolean({ cast: true }).validate('true'), true)
      equal(t.boolean({ cast: true }).validate('false'), true)
      equal(t.boolean({ cast: true }).validate('string'), false)
      equal(t.boolean({ cast: true }).validate(true), true)
      equal(t.boolean({ cast: true }).validate(false), true)
    })

    it('custom validate', function () {
      const schema = t.boolean({ validate: (v) => v === true })
      const e = {}
      equal(schema.validate(false, e), false)
      deepEqual(e, { message: 'boolean validate failed' })
      equal(schema.validate(true), true)
    })

    it('shall clone', function () {
      const schema = t.boolean()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof BooleanT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })
  })

  describe('t.number', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        t.number().default(true)
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not a number')
      }
    })

    it('fails if min is greater max', function () {
      assert.throws(() => {
        t.number({ min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('number validations', function () {
      let e = {}
      equal(t.number(REQUIRED).validate(undefined, e), false)
      equal(e.message, 'not a number')
      equal(t.number().validate(), true)

      equal(t.number().validate(1), true)
      equal(t.number().validate(1.23), true)
      equal(t.number().validate(-1), true)

      e = {}
      equal(t.number({ min: 0 }).validate(1, e), true)
      equal(t.number().min(0).validate(-1, e), false)
      equal(e.message, 'number less than min=0')

      e = {}
      equal(t.number({ min: 0, exclusiveMin: true }).validate(1, e), true)
      equal(t.number().min(0).exclusiveMin().validate(0, e), false)
      equal(e.message, 'number less equal than min=0')

      e = {}
      equal(t.number({ max: 0 }).validate(-1, e), true)
      equal(t.number().max(0).validate(1, e), false)
      equal(e.message, 'number greater than max=0')

      e = {}
      equal(t.number({ max: 0, exclusiveMax: true }).validate(-1, e), true)
      equal(t.number().max(0).exclusiveMax().validate(0, e), false)
      equal(e.message, 'number greater equal than max=0')

      e = {}
      equal(t.number().validate(true, e), false)
      equal(e.message, 'not a number')
      equal(t.number().validate('1.23'), false)
      equal(t.number().validate(null), false)
    })

    it('t.number().analyze()', function () {
      deepEqual(
        t.number().max(0).exclusiveMax().analyze(0),
        new ValidationError({ message: 'number greater equal than max=0' })
      )
    })

    it('cast number from string', function () {
      equal(t.number({ cast: true }).validate('12'), true)
      equal(t.number({ cast: true }).validate('-3.14'), true)
      equal(t.number({ cast: true }).validate('string'), false)
      equal(t.number({ cast: true }).validate([]), false)
      equal(t.number({ cast: true }).validate({}), false)
      equal(t.number({ cast: true }).validate(true), false)
      equal(t.number({ cast: true }).validate(false), false)
    })

    it('custom validate', function () {
      const schema = t.number({ validate: (v) => v === 5 })
      equal(schema.validate(4), false)
      equal(schema.validate(5), true)
      equal(schema.validate('5'), false)
    })

    it('custom validate 2', function () {
      const schema = t.number().custom((v) => v === 5)
      equal(schema.validate(4), false)
      equal(schema.validate(5), true)
      equal(schema.validate('5'), false)
    })

    it('shall clone', function () {
      const schema = t.number()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof NumberT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })
  })

  describe('t.integer', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        t.integer().default(1.2)
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not an integer')
      }
    })

    it('integer validations', function () {
      let e = {}
      equal(t.integer(REQUIRED).validate(undefined, e), false)
      equal(e.message, 'not a number')
      equal(t.integer().validate(), true)

      e = {}
      equal(t.integer().validate(1, e), true)
      equal(t.integer().validate(1.23, e), false)
      equal(e.message, 'not an integer')
      equal(t.integer().validate(-1), true)

      equal(t.integer({ min: 0 }).validate(1), true)
      equal(t.integer({ min: 0 }).validate(-1), false)

      equal(t.integer({ max: 0 }).validate(-1), true)
      equal(t.integer({ max: 0 }).validate(1), false)

      equal(t.integer().validate(true), false)
      equal(t.integer().validate('1.23'), false)
      equal(t.integer().validate(null), false)
    })

    it('t.integer().analyze()', function () {
      deepEqual(
        t.integer().max(0).exclusiveMax().analyze(-0.1),
        new ValidationError({ message: 'not an integer' })
      )
    })

    it('shall clone', function () {
      const schema = t.integer()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof IntegerT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })
  })

  describe('t.date', function () {
    it('fails if min is greater max', function () {
      assert.throws(() => {
        t.date({ min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('fails if min is not a date', function () {
      assert.throws(
        () => {
          t.date({ min: 'abc' })
        },
        {
          message: 'min is not a date'
        }
      )
    })

    it('fails if max is not a date', function () {
      assert.throws(
        () => {
          t.date({ max: 'abc' })
        },
        {
          name: 'TypeError',
          message: 'max is not a date'
        }
      )
    })

    it('date validation', function () {
      equal(t.date(REQUIRED).validate(), false)
      equal(t.date().required().validate(new Date()), true)
      equal(t.date({ ...REQUIRED, min: 1 }).validate(''), false)
      equal(t.date().validate(), true)

      equal(t.date({ min: 2 }).validate(new Date()), true)
      let e = {}
      equal(t.date().min(2).validate(new Date(0), e), false)
      equal(e.message, 'date less than min=1970-01-01T00:00:00.002Z')

      equal(t.date({ min: 2, exclusiveMin: true }).validate(new Date()), true)
      e = {}
      equal(t.date().min(2).exclusiveMin().validate(new Date(2), e), false)
      equal(e.message, 'date less equal than min=1970-01-01T00:00:00.002Z')

      equal(t.date({ max: 2 }).validate(new Date(0)), true)
      e = {}
      equal(t.date({ max: 2 }).validate(new Date(), e), false)
      equal(e.message, 'date greater than max=1970-01-01T00:00:00.002Z')
      e = {}
      equal(
        t.date({ max: 2, exclusiveMax: true }).validate(new Date(2), e),
        false
      )
      equal(e.message, 'date greater equal than max=1970-01-01T00:00:00.002Z')
      equal(t.date().max(2).exclusiveMax().validate(new Date(2)), false)

      equal(t.date().validate(true), false)
      equal(t.date().validate(1.23), false)
      equal(t.date().validate(null), false)
    })

    it('t.date().analyze()', function () {
      deepEqual(
        t.date({ max: 2, exclusiveMax: true }).analyze(new Date(2)),
        new ValidationError({
          message: 'date greater equal than max=1970-01-01T00:00:00.002Z'
        })
      )
    })

    it('custom validation', function () {
      const schema = t.date({
        validate: (v) => v.toISOString() === new Date(0).toISOString()
      })
      equal(schema.validate(new Date(0)), true)
      const e = {}
      equal(schema.validate(new Date(1e3), e), false)
      equal(e.message, 'date validate failed')
    })

    it('shall clone', function () {
      const schema = t.date()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof DateT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })
  })

  describe('t.string', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        t.string().default(1.2)
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not a string')
      }
    })

    it('fails if min is greater max', function () {
      assert.throws(() => {
        t.string({ min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('fails if pattern is not a regex', function () {
      assert.throws(() => {
        t.string({ pattern: 'test' })
      }, /TypeError: pattern not a regex/)
      assert.throws(() => {
        t.string().pattern('test')
      }, /TypeError: pattern not a regex/)
    })

    it('string validation', function () {
      equal(t.string(REQUIRED).validate(), false)
      equal(t.string().required().validate(''), true)
      equal(t.string({ ...REQUIRED, min: 1 }).validate(''), false)
      equal(t.string().validate(''), true)
      equal(t.string().validate(), true)
      equal(t.string({ min: 5 }).validate(''), true)

      equal(t.string().validate('a'), true)
      equal(t.string().validate('1.23'), true)

      equal(t.string({ min: 2 }).validate('aaa'), true)
      equal(t.string().min(2).validate('aa'), true)
      equal(t.string({ min: 2 }).validate('a'), false)

      equal(t.string({ max: 2 }).validate('a'), true)
      equal(t.string().max(2).validate('aa'), true)
      equal(t.string({ max: 2 }).validate('aaaa'), false)

      equal(t.string({ pattern: /ab/ }).validate('aaba'), true)
      const e = {}
      equal(t.string().pattern(/ab/).validate('aaaa', e), false)
      equal(e.message, 'string does not match pattern=ab')

      equal(t.string().validate(true), false)
      equal(t.string().validate(1.23), false)
      equal(t.string().validate(null), false)
    })

    it('custom validation', function () {
      const schema = t.string({ validate: (v) => v === 'str' })
      equal(schema.validate('str'), true)
      const e = {}
      equal(schema.validate('not', e), false)
      equal(e.message, 'string validate failed')
    })

    it('shall clone', function () {
      const schema = t.string()
      const clone = schema.clone().cast()
      assert.ok(clone instanceof StringT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })
  })

  describe('t.string().url', function () {
    it('shall validate', function () {
      equal(t.string().url().validate('https://foo.bar/path?a=1?b=2'), true)
      const e = {}
      equal(t.string().url().validate('/foo.bar/path', e), false)
      deepEqual(e, { message: 'string is not an url' })
    })
  })

  describe('t.enum', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        t.enum([1, 2, 3]).default(4)
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not an enum value')
      }
    })

    it('fails if list is not an array', function () {
      assert.throws(() => {
        t.enum(123)
      }, /TypeError: array expected/)
    })

    it('enum validation', function () {
      equal(t.enum([1], REQUIRED).validate(), false)
      equal(t.enum([1]).validate(), true)

      equal(t.enum([1]).validate(1), true)
      const e = {}
      equal(t.enum([1]).validate(2, e), false)
      equal(e.message, 'not an enum value')

      equal(t.enum([1]).validate(true), false)
      equal(t.enum([1]).validate(1.23), false)
      equal(t.enum([1]).validate(null), false)
    })

    it('shall clone', function () {
      const schema = t.enum([1, 2])
      const clone = schema.clone().cast()
      assert.ok(clone instanceof EnumT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })
  })

  describe('t.array', function () {
    it('shall throw if default() has not correct type', function () {
      try {
        t.array(t.number().min(0).max(10)).default([11])
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: number greater than max=10')
      }
    })

    it('fails if min is greater max', function () {
      assert.throws(() => {
        t.array(t.number(), { min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('fails if type is not a function', function () {
      assert.throws(
        () => {
          t.array(123)
        },
        {
          name: 'TypeError',
          message: 'schema expected'
        }
      )
    })

    it('array validations', function () {
      equal(t.array(t.number(), REQUIRED).validate(), false)
      equal(t.array(t.number(), REQUIRED).validate([]), true)
      equal(t.array(t.number()).validate(), true)
      equal(t.array(t.number()).validate([]), true)

      equal(t.array(t.integer()).validate([1, 2, 3]), true)
      let e = {}
      equal(t.array(t.integer()).validate([1, 2.1, 3], e), false)
      deepEqual(e, { message: 'not an integer', path: ['1'] })

      e = {}
      equal(t.array(t.integer({ min: 2 })).validate([1, 2, 3], e), false)
      deepEqual(e, { message: 'number less than min=2', path: ['0'] })

      equal(t.array(t.integer({ max: 2 })).validate([1, 2, 3]), false)
      equal(t.array(t.integer({ max: 2 })).validate([0, 1]), true)

      e = {}
      equal(t.array(t.integer(), { max: 2 }).validate([1, 2, 3], e), false)
      deepEqual(e, { message: 'array too long max=2' })

      e = {}
      equal(t.array(t.integer(), { min: 2 }).validate([1], e), false)
      deepEqual(e, { message: 'array too short min=2' })
    })

    it('custom validation', function () {
      const schema = t.array(t.string(), { validate: (v) => v[1] === '1' })
      equal(schema.validate(['a', '1', 'c']), true)
      const e = {}
      equal(schema.validate(['a', 'b', 'c'], e), false)
      equal(e.message, 'array validate failed')
    })

    it('shall clone', function () {
      const schema = t.array(t.string())
      const clone = schema.clone().cast()
      assert.ok(clone instanceof ArrayT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })
  })

  describe('t.object', function () {
    it('fails if schema is not an object function', function () {
      assert.throws(() => {
        t.object(123)
      }, /TypeError: schema object expected/)
    })

    it('fails if min is greater max', function () {
      assert.throws(() => {
        t.object({}, { min: 10, max: 1 })
      }, /RangeError: min, max issue/)
    })

    it('shall throw if default() has not correct type', function () {
      try {
        t.object({
          bool: t.boolean()
        }).default({ bool: 'foo' })
        throw new Error()
      } catch (e) {
        assert.equal(e.message, 'default: not a boolean')
      }
    })

    it('object validation', function () {
      equal(t.object({}).validate(), true)
      equal(t.object({}, REQUIRED).validate(), false)
      equal(t.object({}).validate(null), true)
      equal(t.object({}, REQUIRED).validate(null), false)
    })

    it('minProperties maxProperties', function () {
      let e = {}
      equal(
        t.object({}, { ...ADD_PROPS, min: 2 }).validate({ a: 1, b: 2 }, e),
        true
      )
      deepEqual(e, {
        additionalProps: [['a'], ['b']],
        path: []
      })
      e = {}
      equal(t.object({}, { ...ADD_PROPS, min: 2 }).validate({ a: 1 }, e), false)
      deepEqual(e, {
        message: 'object has less than 2 properties'
      })
      e = {}
      equal(
        t.object({}, { ...ADD_PROPS, max: 2 }).validate({ a: 1, b: 2 }, e),
        true
      )
      deepEqual(e, {
        additionalProps: [['a'], ['b']],
        path: []
      })
      e = {}
      equal(
        t
          .object({}, { ...ADD_PROPS, max: 2 })
          .validate({ a: 1, b: 2, c: 3 }, e),
        false
      )
      deepEqual(e, {
        message: 'object has more than 2 properties'
      })
    })

    let schema
    before(function () {
      schema = {
        bool: t.boolean(),
        num: t.number(),
        int: t.integer(),
        str: t.string(REQUIRED),
        arr: t.array(t.number()),
        obj: t.object(
          {
            nested: t.integer()
          },
          { additionalProperties: true }
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
      equal(t.object(schema).validate(v), true)
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
      equal(t.object(schema).validate(v, e), false)
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
      equal(t.object(schema).validate(v, e), false)
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
      equal(t.object(schema).validate(v, e), false)
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
      equal(t.object(schema).validate(v, e), false)
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
      const _schema = { ...schema, str: t.string({ required: false }) }
      equal(t.object(_schema).validate(v, e), true)
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
      equal(t.object(schema).validate(v, e), false)
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
      equal(t.object(schema).additionalProperties().validate(v, e), true)
      deepEqual(e, {
        additionalProps: [['obj', 'test'], ['other']],
        path: []
      })
    })

    it('validate fn', function () {
      // if `flag` === true then `test` must be 1
      const schema = t.object(
        {
          flag: t.boolean(REQUIRED),
          test: t.number()
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
      const schema = t.object(t.string())
      const clone = schema.clone().cast()
      assert.ok(clone instanceof ObjectT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })
  })

  describe('t.instance', function () {
    it('shall validate', function () {
      const schema = t.instance(String)
      // eslint-disable-next-line no-new-wrappers
      equal(schema.validate(new String('string')), true)

      const e = {}
      // eslint-disable-next-line no-new-wrappers
      equal(schema.validate(new Number(7), e), false)
      equal(e.message, 'not an instance of String')
    })

    it('is not required', function () {
      const schema = t.instance(String)
      const err = schema.analyze()
      equal(err, null)
    })

    it('shall clone', function () {
      const schema = t.instance(Number)
      const clone = schema.clone().cast()
      assert.ok(clone instanceof InstanceT)
      assert.notEqual(clone, schema)
      assert.notEqual(clone._cast, schema._cast)
    })

    it('custom validation', function () {
      const schema = t.instance(Number).custom((v) => v === 7)
      // eslint-disable-next-line no-new-wrappers
      const err = schema.analyze(new Number(42))
      equal(err.message, 'instance validate failed')
    })
  })

  describe('t.oneOf', function () {
    it('fails if schema is not an array', function () {
      assert.throws(() => {
        t.oneOf(123)
      }, /TypeError: schema array expected/)
    })

    it('string or number', function () {
      const schema = t.oneOf([t.number(), t.string()])

      equal(schema.validate(1), true)
      equal(schema.validate('1'), true)
      const e = {}
      equal(schema.validate(true, e), false)
      deepEqual(e, { message: 'oneOf failed, matches 0 schemas' })
    })

    it('objects', function () {
      const schema = t.oneOf([
        // if flag === false then msg must be empty string
        t.object({
          flag: t.boolean({ required: true, validate: (v) => !v }),
          msg: t.string({ required: true, min: 0, max: 0 })
        }),
        // otherwise msg must be at least 2 chars long
        t.object({
          flag: t.boolean({ required: true, validate: (v) => v }),
          msg: t.string({ required: true, min: 2 })
        })
      ])

      equal(schema.validate({ flag: false, msg: '' }), true)
      equal(schema.validate({ flag: true, msg: 'hi' }), true)
      const e = {}
      equal(schema.validate({ flag: true, msg: '' }, e), false)
      deepEqual(e, { message: 'oneOf failed, matches 0 schemas' })
    })

    it('shall clone', function () {
      const schema = t.oneOf([t.number(), t.string()])
      const clone = schema.clone()
      assert.ok(clone instanceof OneOf)
      assert.notEqual(clone, schema)
    })

    it('optional value', function () {
      const schema = t.oneOf([t.string(), t.number()])
      const err = schema.analyze()
      equal(err, null)
    })

    it('requires a value', function () {
      const schema = t.oneOf([t.string(), t.number()]).required()
      const err = schema.analyze()
      equal(err.message, 'oneOf failed, matches 2 schemas')
    })

    it('requires at least a number', function () {
      const schema = t.oneOf([t.string(), t.number().required()])
      const err = schema.analyze()
      equal(err.message, 'oneOf failed, number required')
    })

    it('fails with custom validation', function () {
      const schema = t.oneOf([t.string(), t.number()]).custom((v) => {
        return v === 3
      })
      const err = schema.analyze(1)
      equal(err.message, 'oneOf validate failed')
    })

    it('ok with custom validation', function () {
      const schema = t.oneOf([t.string(), t.number()]).custom((v) => {
        return v === 3
      })
      const err = schema.analyze(3)
      equal(err, null)
    })

    it('string or array of strings', function () {
      const schema = t.oneOf([t.array(t.string()), t.string()])
      equal(schema.validate('one'), true)
      equal(schema.validate(['one', 'two']), true)
      equal(schema.validate(1), false)
      equal(schema.validate([1, 'two']), false)
    })
  })

  describe('t.anyOf', function () {
    it('fails if schema is not an array', function () {
      assert.throws(() => {
        t.anyOf(123)
      }, /TypeError: schema array expected/)
    })

    it('string or number', function () {
      const schema = t.anyOf([t.number(), t.string()])

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
      const schema = t.anyOf([t.number(), t.string()])
      const clone = schema.clone()
      assert.ok(clone instanceof AnyOf)
      assert.notEqual(clone, schema)
    })

    it('fails with custom validation', function () {
      const schema = t.anyOf([t.string(), t.number()]).custom((v) => {
        return v === 3
      })
      const err = schema.analyze(1)
      equal(err.message, 'anyOf validate failed')
    })
  })

  describe('t.allOf', function () {
    it('fails if schema is not an array', function () {
      assert.throws(() => {
        t.allOf(123)
      }, /TypeError: schema array expected/)
    })

    it('a or b', function () {
      const schema = t.allOf([
        t.object({ a: t.string().min(3) }).additionalProperties(),
        t.object({ b: t.string().min(5) }).additionalProperties()
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
      const schema = t.allOf([t.number(), t.string()])
      const clone = schema.clone()
      assert.ok(clone instanceof AllOf)
      assert.notEqual(clone, schema)
    })

    it('fails with custom validation', function () {
      const schema = t
        .allOf([
          t.object({ a: t.integer().min(3) }).additionalProperties(),
          t.object({ b: t.integer().min(5) }).additionalProperties()
        ])
        .custom((v) => {
          return v.a === 3
        })
      const err = schema.analyze({ a: 4, b: 7 })
      equal(err.message, 'allOf validate failed')
    })
  })
})
