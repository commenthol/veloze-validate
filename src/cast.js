import { validateDateTime } from './validate.js'

/** @typedef {import('./validate.js').ValidationFn} ValidationFn */

const booleanCast = (v) => (v === 'true' || v === 'false' ? v === 'true' : v)

const numberCast = (v) =>
  typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : v

const anyCast = (v) => v

const stringDateTimeCast = (v) => new Date(v)

const arrayCast = (schema) => (v) => Array.isArray(v) ? v.map(cast(schema)) : v

const objectCast = (schema) => (v) => {
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

const oneOrAnyOfCast = (schemas) => (v) => {
  // obtain first applicable schema
  for (const schema of schemas) {
    if (schema(v)) {
      return cast(schema)(v)
    }
  }
  return v
}

/**
 * cast values by schema
 * @param {ValidationFn | any} schema
 * @param {ValidationFn | any} [other]
 * @returns {(any) => any}
 */
export function cast (schema, other) {
  const { type, cast, validate } = schema

  switch (type) {
    case 'boolean':
      return cast ? booleanCast : anyCast
    case 'integer':
    case 'number':
      return cast ? numberCast : anyCast
    case 'string':
      return cast && validate === validateDateTime
        ? stringDateTimeCast
        : anyCast
    case 'date':
    case 'enum':
      return anyCast
    case 'array':
      return arrayCast(schema.schema)
    case 'object':
      return objectCast(schema.schema)
    case 'oneOf':
    case 'anyOf':
      return oneOrAnyOfCast(schema.schemas)
    default:
      if (other) {
        return other(schema)
      }
      throw new TypeError(`unknown schema type=${type}`)
  }
}
