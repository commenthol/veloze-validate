/** @typedef {import('./validate.js').ValidationFn} ValidationFn */

const json = (v) => JSON.parse(JSON.stringify(v))

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
      const { required } = schema
      return json({
        type,
        required
      })
    }
    case 'integer':
    case 'number': {
      const { required, min, max, exclusiveMin, exclusiveMax } = schema
      return json({
        type,
        required,
        minimum: min,
        maximum: max,
        exclusiveMin,
        exclusiveMax
      })
    }
    case 'date': {
      // no JSON schema type available
      return
    }
    case 'string': {
      const { required, format, min, max, pattern } = schema
      return json({
        type,
        format,
        required,
        minLength: min,
        maxLength: max,
        pattern: pattern?.source
      })
    }
    case 'enum': {
      const { required, list } = schema
      return json({
        enum: list,
        required
      })
    }
    case 'array': {
      const { required, min, max, schema: subschema } = schema
      const out = json({
        type,
        required,
        minItems: min,
        maxItems: max
      })
      out.items = toJsonSchema(subschema)
      return out
    }
    case 'object': {
      const {
        required,
        min,
        max,
        additionalProperties,
        schema: subschema
      } = schema
      const out = json({
        type,
        required,
        minProperties: min,
        maxProperties: max,
        additionalProperties
      })
      out.properties = Object.entries(subschema).reduce(
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
        oneOf: schema.schemas.map((subschema) => toJsonSchema(subschema))
      }
    }
    case 'anyOf': {
      return {
        anyOf: schema.schemas.map((subschema) => toJsonSchema(subschema))
      }
    }
    default: {
      // TODO: make extensible!
      throw new TypeError(`unknown schema type=${type}`)
    }
  }
}
