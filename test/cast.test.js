import assert, { equal, deepEqual } from 'assert/strict'
import {
  cast,
  booleanT,
  numberT,
  integerT,
  stringT,
  stringDateTimeT,
  enumT,
  arrayT,
  objectT,
  oneOf,
  anyOf,
  dateT
} from '../src/index.js'

describe('cast', function () {
  describe('boolean', function () {
    it('shall cast', function () {
      const schema = booleanT({ cast: true })
      equal(cast(schema)(true), true)
      equal(cast(schema)('true'), true)
      equal(cast(schema)(false), false)
      equal(cast(schema)('false'), false)
    })

    it('shall not cast', function () {
      const schema = booleanT({ cast: false })
      equal(cast(schema)(true), true)
      equal(cast(schema)('true'), 'true')
      equal(cast(schema)(false), false)
      equal(cast(schema)('false'), 'false')
    })
  })

  describe('number', function () {
    it('shall cast', function () {
      const schema = numberT({ cast: true })
      equal(cast(schema)(5.67), 5.67)
      equal(cast(schema)('5.67'), 5.67)
    })

    it('shall not cast', function () {
      const schema = booleanT({ cast: false })
      equal(cast(schema)(5.67), 5.67)
      equal(cast(schema)('5.67'), '5.67')
    })
  })

  describe('integer', function () {
    it('shall cast', function () {
      const schema = integerT({ cast: true })
      equal(cast(schema)(5), 5)
      equal(cast(schema)('5'), 5)
    })

    it('shall not cast', function () {
      const schema = integerT({ cast: false })
      equal(cast(schema)(15), 15)
      equal(cast(schema)('15'), '15')
    })
  })

  describe('date', function () {
    it('shall cast date', function () {
      const schema = dateT()
      deepEqual(cast(schema)(new Date(1)), new Date(1))
    })
  })

  describe('string', function () {
    it('shall cast stringDateTimeT', function () {
      const schema = stringDateTimeT({ cast: true })
      deepEqual(
        cast(schema)('1900-01-01T00:00:00Z'),
        new Date('1900-01-01T00:00:00Z')
      )
    })

    it('shall not cast stringDateTimeT', function () {
      const schema = stringDateTimeT({ cast: false })
      equal(cast(schema)('1900-01-01T00:00:00Z'), '1900-01-01T00:00:00Z')
    })

    it('shall not cast stringT', function () {
      const schema = stringT({ cast: true }) // cast has no effect on stringT
      equal(cast(schema)('1900-01-01T00:00:00Z'), '1900-01-01T00:00:00Z')
    })
  })

  describe('enum', function () {
    it('shall pass enum values', function () {
      const schema = enumT([1, '2', 'three', 4.12])
      equal(cast(schema)('2'), '2')
      equal(cast(schema)('3'), '3') // NOTE: always pass through validation first!
    })
  })

  describe('array', function () {
    it('shall ignore undefined', function () {
      const schema = arrayT(numberT({ cast: true }))
      deepEqual(cast(schema)(), undefined)
    })

    it('shall cast array number values', function () {
      const schema = arrayT(numberT({ cast: true }))
      deepEqual(cast(schema)([1, '-2', '4.1', '-1e-23']), [1, -2, 4.1, -1e-23])
    })
  })

  describe('object', function () {
    it('shall cast', function () {
      const schema = objectT({
        num: numberT({ cast: true })
      })
      deepEqual(cast(schema)({ num: '12.12' }), { num: 12.12 })
    })

    it('shall ignore null', function () {
      const schema = objectT({
        num: numberT({ cast: true })
      })
      deepEqual(cast(schema)(null), null)
    })

    it('shall ignore additional props', function () {
      const schema = objectT(
        {
          num: numberT({ cast: true })
        },
        { additionalProperties: true }
      )
      deepEqual(cast(schema)({ num: '12.12', str: 'hi' }), {
        num: 12.12,
        str: 'hi'
      })
    })

    it('shall cast nested props', function () {
      const schema = objectT(
        {
          num: numberT({ cast: true }),
          nested: objectT({
            foo: integerT({ cast: true })
          })
        },
        { additionalProperties: true }
      )
      deepEqual(
        cast(schema)({ num: 12.12, str: 'hi', nested: { foo: '-17' } }),
        {
          num: 12.12,
          str: 'hi',
          nested: { foo: -17 }
        }
      )
    })
  })

  describe('oneOf', function () {
    it('shall cast', function () {
      const schema = oneOf([numberT({ cast: true }), booleanT({ cast: true })])
      equal(cast(schema)('12.1'), 12.1)
      equal(cast(schema)('false'), false)
      equal(cast(schema)('true'), true)
      deepEqual(cast(schema)([]), [])
    })
  })

  describe('anyOf', function () {
    it('shall cast', function () {
      const schema = anyOf([numberT({ cast: true }), booleanT({ cast: true })])
      equal(cast(schema)('12.1'), 12.1)
      equal(cast(schema)('false'), false)
      equal(cast(schema)('true'), true)
      deepEqual(cast(schema)([]), [])
    })
  })

  describe('unknown', function () {
    it('shall throw', function () {
      assert.throws(
        () => {
          const schema = (() => {
            function unknown () {}
            Object.assign(unknown, { type: 'unknown' })
            return unknown
          })()
          cast(schema)('hi')
        },
        {
          name: 'TypeError',
          message: 'unknown schema type=unknown'
        }
      )
    })
  })

  describe('extension', function () {
    it('shall cast', function () {
      const regexT = () => {
        const _regexT = () => true
        Object.assign(_regexT, { type: 'regex' })
        return _regexT
      }
      const castRegex = (schema) => {
        if (schema?.type === 'regex') {
          return (v) => new RegExp(v)
        }
      }

      const schema = regexT()
      deepEqual(
        cast(schema, castRegex)('hi'),
        /hi/
      )
    })
  })
})
