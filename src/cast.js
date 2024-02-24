/** @typedef {import('./validate.js').BaseT} BaseT */
/** @typedef {import('./validate.js').ValidationFn} ValidationFn */

/**
 * @param {string|boolean} v
 * @returns {boolean}
 */
// @ts-expect-error
const booleanCoerce = (v) => (v === 'true' || v === 'false' ? v === 'true' : v)

/**
 * @param {string|number} v
 * @returns {number}
 */
const numberCoerce = (v) =>
  // @ts-expect-error
  typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : v

/**
 * @param {any} v
 * @returns {any}
 */
const noCoerce = (v) => v

/**
 * @param {string} v
 * @returns {Date}
 */
const stringDateTimeCoerce = (v) => new Date(v)

/**
 * @param {string} v
 * @returns {RegExp}
 */
const stringRegexCoerce = (v) => new RegExp(v)

/**
 * @param {BaseT} schema
 * @returns {(v: any[]) => any[]}
 */
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
  for (const [prop, subSchema] of Object.entries(schema)) {
    if (subSchema._default === undefined || obj[prop] !== undefined) {
      continue
    }
    obj[prop] = getDefault(subSchema._default)
  }
  return obj
}

/**
 * @param {BaseT[]} schemas
 * @returns {any}
 */
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
  const { type, format, coerce, _cast, _default } = schema

  if (_cast && typeof coerce === 'function') {
    return (v) => schema.coerce(v)
  }

  let fn = noCoerce
  switch (type) {
    case 'boolean':
      if (_cast) {
        fn = booleanCoerce
      }
      break
    case 'integer':
    case 'number':
      if (_cast) {
        fn = numberCoerce
      }
      break
    case 'string': {
      if (_cast) {
        switch (format) {
          case 'date-time':
            fn = stringDateTimeCoerce
            break
          case 'regex':
            fn = stringRegexCoerce
            break
        }
      }
      break
    }
    case 'date':
    case 'enum':
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
  }

  return _default === undefined
    ? fn
    : (v) =>
        v !== undefined
          ? fn(v)
          : getDefault(_default)
}

const getDefault = (_default) => typeof _default === 'function' ? _default() : _default
