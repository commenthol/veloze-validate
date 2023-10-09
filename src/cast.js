import { validateDateTime } from './validate.js'

/** @typedef {import('./validate.js').ValidationFn} ValidationFn */

const booleanCoerce = (v) => (v === 'true' || v === 'false' ? v === 'true' : v)

const numberCoerce = (v) =>
  typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : v

const noCoerce = (v) => v

const stringDateTimeCoerce = (v) => new Date(v)

const arrayCoerce = (schema) => (v) => Array.isArray(v) ? v.map(cast(schema)) : v

const objectCoerce = (schema) => (v) => {
  if (!v) return v
  const obj = {}
  for (const [prop, value] of Object.entries(v)) {
    const subSchema = schema[prop]
    if (subSchema) {
      obj[prop] = cast(subSchema)(value)
    } else {
      // additional props
      obj[prop] = value
    }
  }
  return obj
}

const oneOrAnyOfCoerce = (schemas) => (v) => {
  // obtain first applicable schema
  for (const schema of schemas) {
    if (schema.validate(v)) {
      return cast(schema)(v)
    }
  }
  return v
}

/**
 * cast values by schema
 * @param {ValidationFn | any} schema
 * @returns {(any) => any}
 */
export function cast (schema) {
  const { type, format, coerce, _cast, _validate } = schema

  if (_cast && typeof coerce === 'function') {
    return (v) => schema.coerce(v)
  }

  switch (type) {
    case 'boolean':
      return _cast ? booleanCoerce : noCoerce
    case 'integer':
    case 'number':
      return _cast ? numberCoerce : noCoerce
    case 'string':
      return _cast && (_validate === validateDateTime || format === 'date-time')
        ? stringDateTimeCoerce
        : noCoerce
    case 'date':
    case 'enum':
      return noCoerce
    case 'array':
      return arrayCoerce(schema._schema)
    case 'object':
      return objectCoerce(schema._schema)
    case 'oneOf':
    case 'anyOf':
      return oneOrAnyOfCoerce(schema._schemas)
    default:
      throw new TypeError(`unknown schema type=${type}`)
  }
}
