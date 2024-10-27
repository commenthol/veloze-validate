import { equal, deepEqual } from 'assert/strict'
import { cast, StringT, t } from '../src/index.js'

describe('cast', function () {
  describe('boolean', function () {
    it('shall cast', function () {
      const schema = t.boolean({ cast: true })
      equal(cast(schema)(true), true)
      equal(cast(schema)('true'), true)
      equal(cast(schema)(false), false)
      equal(cast(schema)('false'), false)
    })

    it('shall not cast', function () {
      const schema = t.boolean({ cast: false })
      equal(cast(schema)(true), true)
      equal(cast(schema)('true'), 'true')
      equal(cast(schema)(false), false)
      equal(cast(schema)('false'), 'false')
    })

    it('shall use default', function () {
      const schema = t.boolean().default(true)
      equal(cast(schema)(), true)
    })

    it('shall ignore undefined default', function () {
      const schema = t.boolean().cast().default(true)
      equal(cast(schema)('true'), true)
    })
  })

  describe('number', function () {
    it('shall cast', function () {
      const schema = t.number({ cast: true })
      equal(cast(schema)(5.67), 5.67)
      equal(cast(schema)('5.67'), 5.67)
    })

    it('shall not cast', function () {
      const schema = t.number({ cast: false })
      equal(cast(schema)(5.67), 5.67)
      equal(cast(schema)('5.67'), '5.67')
    })

    it('shall use static default', function () {
      const schema = t.number().default(1.23)
      equal(cast(schema)(), 1.23)
    })

    it('shall use dynamic default', function () {
      const schema = t.number().default(() => 1.23)
      equal(cast(schema)(), 1.23)
    })
  })

  describe('integer', function () {
    it('shall cast', function () {
      const schema = t.integer({ cast: true })
      equal(cast(schema)(5), 5)
      equal(cast(schema)('5'), 5)
    })

    it('shall not cast', function () {
      const schema = t.integer({ cast: false })
      equal(cast(schema)(15), 15)
      equal(cast(schema)('15'), '15')
    })
  })

  describe('date', function () {
    it('shall cast date', function () {
      const schema = t.date()
      deepEqual(cast(schema)(new Date(1)), new Date(1))
    })
  })

  describe('string', function () {
    it('shall cast t.string().dateTime()', function () {
      const schema = t.string().cast().dateTime()
      deepEqual(
        cast(schema)('1900-01-01T00:00:00Z'),
        new Date('1900-01-01T00:00:00Z')
      )
    })

    it('shall not cast t.string().dateTime()', function () {
      const schema = t.string().dateTime()
      equal(cast(schema)('1900-01-01T00:00:00Z'), '1900-01-01T00:00:00Z')
    })

    it('shall cast t.string().regex()', function () {
      const schema = t.string().cast().regex()
      deepEqual(cast(schema)('closed (?:group)'), /closed (?:group)/)
    })

    it('shall not cast t.string', function () {
      const schema = t.string({ cast: true }) // cast has no effect on t.string
      equal(cast(schema)('1900-01-01T00:00:00Z'), '1900-01-01T00:00:00Z')
    })
  })

  describe('enum', function () {
    it('shall pass enum values', function () {
      const schema = t.enum([1, '2', 'three', 4.12])
      equal(cast(schema)('2'), '2')
      equal(cast(schema)('3'), '3') // NOTE: always pass through validation first!
    })
  })

  describe('array', function () {
    it('shall ignore undefined', function () {
      const schema = t.array(t.number({ cast: true }))
      deepEqual(cast(schema)(), undefined)
    })

    it('shall cast array number values', function () {
      const schema = t.array(t.number({ cast: true }))
      deepEqual(cast(schema)([1, '-2', '4.1', '-1e-23']), [1, -2, 4.1, -1e-23])
    })
  })

  describe('object', function () {
    it('shall cast', function () {
      const schema = t.object({
        num: t.number({ cast: true })
      })
      deepEqual(cast(schema)({ num: '12.12' }), { num: 12.12 })
    })

    it('shall ignore null', function () {
      const schema = t.object({
        num: t.number({ cast: true })
      })
      deepEqual(cast(schema)(null), null)
    })

    it('shall ignore additional props', function () {
      const schema = t.object(
        {
          num: t.number({ cast: true })
        },
        { additionalProperties: true }
      )
      deepEqual(cast(schema)({ num: '12.12', str: 'hi' }), {
        num: 12.12,
        str: 'hi'
      })
    })

    it('shall cast nested props', function () {
      const schema = t.object(
        {
          num: t.number({ cast: true }),
          nested: t.object({
            foo: t.integer({ cast: true })
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

    it('shall apply defaults', function () {
      const schema = t.object({
        int: t.integer().default(42),
        fn: t.string().default(() => 'is7'),
        cast: t.number().cast()
      })
      const actual = cast(schema)({ cast: '3.1415' })
      deepEqual(actual, {
        int: 42,
        fn: 'is7',
        cast: 3.1415
      })
    })
  })

  describe('oneOf', function () {
    it('shall cast', function () {
      const schema = t.oneOf([
        t.number({ cast: true }),
        t.boolean({ cast: true })
      ])
      equal(cast(schema)('12.1'), 12.1)
      equal(cast(schema)('false'), false)
      equal(cast(schema)('true'), true)
      deepEqual(cast(schema)([]), [])
    })
  })

  describe('anyOf', function () {
    it('shall cast', function () {
      const schema = t.anyOf([
        t.number({ cast: true }),
        t.boolean({ cast: true })
      ])
      equal(cast(schema)('12.1'), 12.1)
      equal(cast(schema)('false'), false)
      equal(cast(schema)('true'), true)
      deepEqual(cast(schema)([]), [])
    })
  })

  describe('extension', function () {
    it('shall cast', function () {
      class RegExpT extends StringT {
        coerce(v) {
          return new RegExp(v)
        }
      }

      const schema = new RegExpT().cast()
      deepEqual(cast(schema)('^hi'), /^hi/)
    })
  })
})
