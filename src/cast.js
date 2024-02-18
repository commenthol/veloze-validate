import { validateDateTime } from './validate.js'

/** @typedef {import('./validate.js').ValidationFn} ValidationFn */

const booleanCoerce = (v) => (v === 'true' || v === 'false' ? v === 'true' : v)

const numberCoerce = (v) =>
  typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : v

const noCoerce = (v) => v

const stringDateTimeCoerce = (v) => new Date(v)

const arrayCoerce = (schema) => (v) =>
  Array.isArray(v) ? v.map(cast(schema)) : v

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
  const { type, format, coerce, _cast, _validate, _default } = schema

  if (_cast && typeof coerce === 'function') {
    return (v) => schema.coerce(v)
  }

  let fn
  switch (type) {
    case 'boolean':
      fn = _cast ? booleanCoerce : noCoerce
      break
    case 'integer':
    case 'number':
      fn = _cast ? numberCoerce : noCoerce
      break
    case 'string':
      fn =
        _cast && (_validate === validateDateTime || format === 'date-time')
          ? stringDateTimeCoerce
          : noCoerce
      break
    case 'date':
    case 'enum':
      fn = noCoerce
      break
    case 'array':
      fn = arrayCoerce(schema._schema)
      break
    case 'object':
      fn = objectCoerce(schema._schema)
      break
    case 'oneOf':
    case 'anyOf':
    case 'allOf':
      fn = oneOrAnyOfCoerce(schema._schemas)
      break
    default:
      throw new TypeError(`unknown schema type=${type}`)
  }
  return _default === undefined
    ? fn
    : (v) =>
        v !== undefined
          ? fn(v)
          : typeof _default === 'function'
            ? _default()
            : _default
}
