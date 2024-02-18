/** @typedef {import('./validate.js').ValidationFn} ValidationFn */

export const json = (v) => JSON.parse(JSON.stringify(v))

/**
 * convert validation to json schema;
 *
 * NOTE: Unknown validation functions can't be converted to JSON Schema.
 *
 * @param {ValidationFn | any} schema
 * @returns {object} json schema
 */
export const toJsonSchema = (schema) => {
  const { type } = schema

  switch (type) {
    case 'boolean': {
      const { _required } = schema
      return json({
        type,
        required: _required
      })
    }
    case 'integer':
    case 'number': {
      const { _required, _min, _max, _exclusiveMin, _exclusiveMax } = schema
      return json({
        type,
        required: _required,
        minimum: _min === Number.MIN_SAFE_INTEGER ? undefined : _min,
        maximum: _max === Number.MAX_SAFE_INTEGER ? undefined : _max,
        exclusiveMin: _exclusiveMin,
        exclusiveMax: _exclusiveMax
      })
    }
    case 'date': {
      // no JSON schema type available
      return
    }
    case 'string': {
      const { _required, format, _min, _max, _pattern } = schema
      return json({
        type,
        format,
        required: _required,
        minLength: _min,
        maxLength: _max,
        pattern: _pattern?.source
      })
    }
    case 'enum': {
      const { _required, _list } = schema
      return json({
        enum: _list,
        required: _required
      })
    }
    case 'array': {
      const { _required, _min, _max, _schema } = schema
      const out = json({
        type,
        required: _required,
        minItems: _min,
        maxItems: _max
      })
      out.items = toJsonSchema(_schema)
      return out
    }
    case 'object': {
      const { _required, _min, _max, _additionalProperties, _schema } = schema
      const out = json({
        type,
        required: _required,
        minProperties: _min,
        maxProperties: _max,
        additionalProperties: _additionalProperties
      })
      out.properties = Object.entries(_schema).reduce(
        (curr, [prop, schema]) => {
          curr[prop] = toJsonSchema(schema)
          return curr
        },
        {}
      )
      return out
    }
    case 'oneOf': {
      return {
        oneOf: schema._schemas.map((subschema) => toJsonSchema(subschema))
      }
    }
    case 'anyOf': {
      return {
        anyOf: schema._schemas.map((subschema) => toJsonSchema(subschema))
      }
    }
    case 'allOf': {
      return {
        allOf: schema._schemas.map((subschema) => toJsonSchema(subschema))
      }
    }
    default: {
      if (typeof schema.jsonSchema === 'function') {
        return schema.jsonSchema()
      }
      throw new TypeError(`unknown schema type=${type}`)
    }
  }
}
