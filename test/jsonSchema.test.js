import assert, { deepEqual } from 'assert/strict'
import {
  toJsonSchema,
  type as t,
  stringUrlT,
  stringDateTimeT,
  stringUuidT,
  oneOf,
  anyOf,
  REQUIRED
} from '../src/index.js'

describe('jsonSchema', function () {
  it('unkwnown schema shall throw', function () {
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
  })

  it('shall ignore date', function () {
    deepEqual(toJsonSchema(t.date()), undefined)
  })

  it('convert string', function () {
    deepEqual(toJsonSchema(t.string()), {
      type: 'string'
    })
    deepEqual(toJsonSchema(t.string(REQUIRED)), {
      type: 'string',
      required: true
    })
    deepEqual(toJsonSchema(t.string({ min: 2, max: 4 })), {
      type: 'string',
      minLength: 2,
      maxLength: 4
    })
    deepEqual(toJsonSchema(t.string({ pattern: /^foo\.bar/ })), {
      type: 'string',
      pattern: '^foo\\.bar'
    })
  })

  it('convert string formats', function () {
    deepEqual(toJsonSchema(stringUrlT()), {
      type: 'string',
      format: 'url'
    })

    deepEqual(toJsonSchema(stringDateTimeT()), {
      type: 'string',
      format: 'date-time'
    })

    deepEqual(toJsonSchema(stringUuidT()), {
      type: 'string',
      format: 'uuid'
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
  })

  it('convert array', function () {
    deepEqual(toJsonSchema(t.array(t.number())), {
      type: 'array',
      items: {
        type: 'number'
      }
    })
    deepEqual(toJsonSchema(t.array(t.string(REQUIRED), REQUIRED)), {
      type: 'array',
      required: true,
      items: {
        type: 'string',
        required: true
      }
    })
    deepEqual(toJsonSchema(t.array(t.string(), { min: 0, max: 5 })), {
      type: 'array',
      minItems: 0,
      maxItems: 5,
      items: {
        type: 'string'
      }
    })
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
      properties: {
        arr: {
          type: 'array',
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
          properties: {
            nested: {
              type: 'integer'
            }
          },
          additionalProperties: true
        },
        str: {
          type: 'string',
          required: true
        }
      }
    })
  })

  it('convert oneOf', function () {
    const schema = oneOf([t.number(), t.string()])
    deepEqual(toJsonSchema(schema), {
      oneOf: [{ type: 'number' }, { type: 'string' }]
    })
  })

  it('convert anyOf', function () {
    const schema = anyOf([t.number(), t.string()])
    deepEqual(toJsonSchema(schema), {
      anyOf: [{ type: 'number' }, { type: 'string' }]
    })
  })
})
