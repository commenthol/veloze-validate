import assert, { deepEqual } from 'assert/strict'
import {
  toJsonSchema,
  t,
  stringFormatT,
  oneOf,
  anyOf,
  allOf,
  REQUIRED
} from '../src/index.js'

describe('jsonSchema', function () {
  it('unknown schema shall throw', function () {
    assert.throws(
      () => {
        toJsonSchema({})
      },
      {
        message: 'unknown schema type=undefined'
      }
    )
  })

  it('convert boolean', function () {
    deepEqual(toJsonSchema(t.boolean()), {
      type: 'boolean'
    })
    deepEqual(toJsonSchema(t.boolean(REQUIRED)), {
      type: 'boolean',
      required: true
    })
    deepEqual(toJsonSchema(t.boolean().default(false)), {
      type: 'boolean',
      default: false
    })
  })

  it('convert number', function () {
    deepEqual(toJsonSchema(t.number()), {
      type: 'number'
    })
    deepEqual(toJsonSchema(t.number(REQUIRED)), {
      type: 'number',
      required: true
    })
    deepEqual(toJsonSchema(t.number({ min: 2.01, max: 3.14 })), {
      type: 'number',
      minimum: 2.01,
      maximum: 3.14
    })
    deepEqual(
      toJsonSchema(
        t.number({ min: 0, max: 4, exclusiveMin: true, exclusiveMax: true })
      ),
      {
        type: 'number',
        minimum: 0,
        maximum: 4,
        exclusiveMin: true,
        exclusiveMax: true
      }
    )
    deepEqual(toJsonSchema(t.number().default(1.234)), {
      type: 'number',
      default: 1.234
    })
  })

  it('shall ignore date', function () {
    deepEqual(toJsonSchema(t.date()), undefined)
  })

  it('convert string', function () {
    deepEqual(toJsonSchema(t.string()), {
      type: 'string',
      minLength: 0,
      maxLength: 255
    })
    deepEqual(toJsonSchema(t.string(REQUIRED)), {
      type: 'string',
      minLength: 0,
      maxLength: 255,
      required: true
    })
    deepEqual(toJsonSchema(t.string({ min: 2, max: 4 })), {
      type: 'string',
      minLength: 2,
      maxLength: 4
    })
    deepEqual(toJsonSchema(t.string({ pattern: /^foo\.bar/ })), {
      type: 'string',
      minLength: 0,
      maxLength: 255,
      pattern: '^foo\\.bar'
    })
    deepEqual(toJsonSchema(t.string().default('hello')), {
      type: 'string',
      minLength: 0,
      maxLength: 255,
      default: 'hello'
    })
    deepEqual(toJsonSchema(stringFormatT().regex().min(10).max(20)), {
      type: 'string',
      format: 'regex',
      minLength: 10,
      maxLength: 20
    })
  })

  it('convert string formats', function () {
    deepEqual(toJsonSchema(stringFormatT().url()), {
      type: 'string',
      format: 'uri',
      minLength: 0,
      maxLength: 255
    })

    deepEqual(toJsonSchema(stringFormatT().dateTime()), {
      type: 'string',
      format: 'date-time',
      minLength: 0,
      maxLength: 255
    })

    deepEqual(toJsonSchema(stringFormatT().uuid()), {
      type: 'string',
      format: 'uuid',
      minLength: 0,
      maxLength: 255
    })
  })

  it('convert enum', function () {
    deepEqual(toJsonSchema(t.enum(['a', 'b'])), {
      enum: ['a', 'b']
    })
    deepEqual(toJsonSchema(t.enum(['a', 'b'], REQUIRED)), {
      enum: ['a', 'b'],
      required: true
    })
    deepEqual(toJsonSchema(t.enum(['a', 'b']).default('a')), {
      enum: ['a', 'b'],
      default: 'a'
    })
  })

  it('convert array', function () {
    deepEqual(toJsonSchema(t.array(t.number())), {
      type: 'array',
      minItems: 0,
      maxItems: 255,
      items: {
        type: 'number'
      }
    })
    deepEqual(toJsonSchema(t.array(t.string(REQUIRED), REQUIRED)), {
      type: 'array',
      required: true,
      minItems: 0,
      maxItems: 255,
      items: {
        type: 'string',
        required: true,
        minLength: 0,
        maxLength: 255
      }
    })
    deepEqual(toJsonSchema(t.array(t.string(), { min: 0, max: 5 })), {
      type: 'array',
      minItems: 0,
      maxItems: 5,
      items: {
        type: 'string',
        minLength: 0,
        maxLength: 255
      }
    })
    deepEqual(
      toJsonSchema(t.array(t.string()).min(0).max(5).default(['one', 'two'])),
      {
        type: 'array',
        minItems: 0,
        maxItems: 5,
        items: {
          type: 'string',
          minLength: 0,
          maxLength: 255
        },
        default: ['one', 'two']
      }
    )
  })

  it('convert object', function () {
    const schema = {
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

    deepEqual(toJsonSchema(t.object(schema, REQUIRED)), {
      type: 'object',
      required: true,
      minProperties: 0,
      maxProperties: 255,
      properties: {
        arr: {
          type: 'array',
          minItems: 0,
          maxItems: 255,
          items: {
            type: 'number'
          }
        },
        bool: {
          type: 'boolean'
        },
        int: {
          type: 'integer'
        },
        num: {
          type: 'number'
        },
        obj: {
          type: 'object',
          minProperties: 0,
          maxProperties: 255,
          properties: {
            nested: {
              type: 'integer'
            }
          },
          additionalProperties: true
        },
        str: {
          type: 'string',
          required: true,
          minLength: 0,
          maxLength: 255
        }
      }
    })
  })

  it('convert oneOf', function () {
    const schema = oneOf([t.number(), t.string()])
    deepEqual(toJsonSchema(schema), {
      oneOf: [
        { type: 'number' },
        { type: 'string', minLength: 0, maxLength: 255 }
      ]
    })
  })

  it('convert anyOf', function () {
    const schema = anyOf([t.number(), t.string()])
    deepEqual(toJsonSchema(schema), {
      anyOf: [
        { type: 'number' },
        { type: 'string', minLength: 0, maxLength: 255 }
      ]
    })
  })

  it('convert allOf', function () {
    const schema = allOf([
      t.object({ a: t.number() }, { additionalProperties: true }),
      t.object({ b: t.string() }, { additionalProperties: true })
    ])
    deepEqual(toJsonSchema(schema), {
      allOf: [
        {
          type: 'object',
          additionalProperties: true,
          minProperties: 0,
          maxProperties: 255,
          properties: {
            a: {
              type: 'number'
            }
          }
        },
        {
          type: 'object',
          additionalProperties: true,
          minProperties: 0,
          maxProperties: 255,
          properties: {
            b: {
              maxLength: 255,
              minLength: 0,
              type: 'string'
            }
          }
        }
      ]
    })
  })

  it('schema.jsonSchema', function () {
    class AlwaysValid {
      type = 'alwaysValid'
      validate(_v) {
        return true
      }

      jsonSchema() {
        return { type: this.type }
      }
    }

    const schema = new AlwaysValid()
    deepEqual(toJsonSchema(schema), { type: 'alwaysValid' })
  })
})
