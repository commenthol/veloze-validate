/**
 * @typedef {{
 *  message?: string
 *  path?: string[]
 *  failures?: ValidationFailure[],
 *  additionalProps?: string[][]
 * }} ValidationFailure
 */
/**
 * @typedef {(v: any, e?: ValidationFailure) => boolean} ValidationFn
 */

/**
 * shortcut for { required: true }
 * @example
 * ```js
 * const schema = numberT({ ...REQUIRED, max: 12 })
 * ```
 */
export const REQUIRED = Object.freeze({ required: true })

/**
 * shortcut for { additionalProperties: true }
 * @example
 * ```js
 * const schema = objectT({ num: numberT() }, ADD_PROPS)
 * ```
 */
export const ADD_PROPS = Object.freeze({ additionalProperties: true })

/**
 * @param {{
 *  required?: boolean
 *  cast?: boolean
 *  validate?: (v: boolean, e?: ValidationFailure) => boolean
 * }} [opts]
 * @returns {ValidationFn}
 */
export const booleanT = (opts) => {
  const { required = false, cast = false, validate } = opts || {}

  const _booleanT = (v, e = {}) => {
    if (!required && v === undefined) {
      return true
    }
    if (cast && (v === 'true' || v === 'false')) {
      v = v === 'true'
    }
    if (typeof v !== 'boolean') {
      e.message = 'not a boolean'
      return false
    }
    if (validate && !validate(v, e)) {
      e.message = e.message || 'boolean validate failed'
      return false
    }
    return true
  }

  Object.assign(_booleanT, { ...opts, type: 'boolean' })
  return _booleanT
}

/**
 * @param {{
 *  required?: boolean
 *  cast?: boolean
 *  min?: number
 *  max?: number
 *  exclusiveMin?: boolean
 *  exclusiveMax?: boolean
 *  validate?: (v: number, e?: ValidationFailure) => boolean
 * }} [opts]
 * @returns {ValidationFn}
 */
export const numberT = (opts) => {
  const {
    required = false,
    cast = false,
    min = -Infinity,
    max = Infinity,
    exclusiveMin = false,
    exclusiveMax = false,
    validate
  } = opts || {}
  if (min >= max) {
    throw RangeError('min, max issue')
  }

  const _numberT = (v, e = {}) => {
    if (!required && v === undefined) {
      return true
    }
    if (cast && typeof v === 'string' && !isNaN(Number(v))) {
      v = Number(v)
    }
    if (typeof v !== 'number') {
      e.message = 'not a number'
      return false
    }
    if (exclusiveMin ? v <= min : v < min) {
      e.message = `number less ${exclusiveMin ? 'equal ' : ''}than min=${min}`
      return false
    }
    if (exclusiveMax ? v >= max : v > max) {
      e.message = `number greater ${
        exclusiveMax ? 'equal ' : ''
      }than max=${max}`
      return false
    }
    if (validate && !validate(v, e)) {
      e.message = e.message || 'number validate failed'
      return false
    }
    return true
  }

  Object.assign(_numberT, { ...opts, type: 'number' })
  return _numberT
}

/**
 * @param {{
 *  required?: boolean
 *  cast?: boolean
 *  min?: number
 *  max?: number
 *  exclusiveMin?: boolean
 *  exclusiveMax?: boolean
 *  validate?: (v: number, e?: ValidationFailure) => boolean
 * }} [opts]
 * @returns {ValidationFn}
 */
export const integerT = (opts) => {
  const { required = false } = opts || {}
  const numberF = numberT(opts)

  const _integerT = (v, e = {}) => {
    if (!required && v === undefined) {
      return true
    }
    if (!numberF(v, e)) {
      return false
    }
    if (!Number.isSafeInteger(v)) {
      e.message = 'not an integer'
      return false
    }
    return true
  }

  Object.assign(_integerT, { ...opts, type: 'integer' })
  return _integerT
}

/**
 * @param {{
 *  required?: boolean
 *  min?: Date | number | string
 *  max?: Date | number | string
 *  exclusiveMin?: boolean
 *  exclusiveMax?: boolean
 *  validate?: (v: Date, e?: ValidationFailure) => boolean
 * }} [opts]
 * @returns {(v: any, e: ValidationFailure) => boolean}
 */
export const dateT = (opts) => {
  const { required, validate, min, max, exclusiveMin, exclusiveMax } =
    opts || {}
  const _min = min && new Date(min)
  const _max = max && new Date(max)

  if (_min && isNaN(_min.getTime())) {
    throw TypeError('min is not a date')
  }
  if (_max && isNaN(_max.getTime())) {
    throw TypeError('max is not a date')
  }
  if (_min && _max && _min > _max) {
    throw RangeError('min, max issue')
  }

  const _dateT = (v, e = {}) => {
    if (!required && v === undefined) {
      return true
    }

    if (!(v instanceof Date)) {
      e.message = 'not a Date'
      return false
    }
    if (_min && (exclusiveMin ? v <= _min : v < _min)) {
      e.message = `date less ${
        exclusiveMin ? 'equal ' : ''
      }than min=${_min.toISOString()}`
      return false
    }
    if (_max && (exclusiveMax ? v >= _max : v > _max)) {
      e.message = `date greater ${
        exclusiveMax ? 'equal ' : ''
      }than max=${_max.toISOString()}`
      return false
    }
    if (validate && !validate(v, e)) {
      e.message = e.message || 'date validate failed'
      return false
    }
    return true
  }

  Object.assign(_dateT, { ...opts, min: _min, max: _max, type: 'date' })
  return _dateT
}

/**
 * @param {{
 *  required?: boolean
 *  min?: number
 *  max?: number
 *  pattern?: RegExp
 *  validate?: (v: string, e?: ValidationFailure) => boolean
 * }} [opts]
 * @returns {(v: any, e: ValidationFailure) => boolean}
 */
export const stringT = (opts) => {
  const { required = false, min = 0, max = 255, pattern, validate } = opts || {}
  if (min < 0 || max < 0 || min > max) {
    throw RangeError('min, max issue')
  }
  if (pattern && !(pattern instanceof RegExp)) {
    throw TypeError('pattern not a regex')
  }

  const _stringT = (v, e = {}) => {
    if (!required && (v === undefined || v === '')) {
      return true
    }
    if (typeof v !== 'string') {
      e.message = 'not a string'
      return false
    }
    if (v.length < min) {
      e.message = `string too short min=${min}`
      return false
    }
    if (v.length > max) {
      e.message = `string too long max=${max}`
      return false
    }
    if (pattern && !pattern.test(v)) {
      e.message = `string does not match pattern=${pattern.source}`
      return false
    }
    if (validate && !validate(v, e)) {
      e.message = e.message || 'string validate failed'
      return false
    }
    return true
  }
  const format =
    validate === validateDateTime
      ? 'date-time'
      : validate === validateUrl
        ? 'url'
        : validate === validateUuid
          ? 'uuid'
          : undefined
  Object.assign(_stringT, { ...opts, format, type: 'string' })
  return _stringT
}

/**
 * @param {string} string
 * @param {ValidationFailure} [e]
 * @returns {boolean}
 */
export const validateUrl = (string, e = {}) => {
  try {
    return !!new URL(string)
  } catch (_) {
    e.message = 'string is not an url'
    return false
  }
}

/**
 * @param {{
 *  required?: boolean
 *  min?: number
 *  max?: number
 * }} [opts]
 * @returns {(v: any, e: ValidationFailure) => boolean}
 */
export const stringUrlT = (opts) =>
  stringT({ ...opts, pattern: undefined, validate: validateUrl })

/**
 * @param {string} string
 * @param {ValidationFailure} [e]
 * @returns {boolean}
 */
export const validateDateTime = (string, e = {}) => {
  const d = new Date(string)
  if (isNaN(d.getTime())) {
    e.message = 'string is not a date-time'
    return false
  }
  return true
}

/**
 * - opts.cast: if `true` allow casting string to type Date
 * @param {{
 *  required?: boolean
 *  cast?: boolean
 *  min?: number
 *  max?: number
 * }} [opts]
 * @returns {(v: any, e: ValidationFailure) => boolean}
 */
export const stringDateTimeT = (opts) =>
  stringT({ ...opts, pattern: undefined, validate: validateDateTime })

/**
 * a not so strict UUID check (does not check for uuid version byte)
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * @param {string} string
 * @param {ValidationFailure} [e]
 * @returns {boolean}
 */
export const validateUuid = (string, e = {}) => {
  if (string.length !== 36 || !UUID_RE.test(string)) {
    e.message = 'string is not an uuid'
    return false
  }
  return true
}

/**
 * @param {{
 *  required?: boolean
 *  min?: number
 *  max?: number
 * }} [opts]
 * @returns {(v: any, e: ValidationFailure) => boolean}
 */
export const stringUuidT = (opts) =>
  stringT({ ...opts, pattern: undefined, validate: validateUuid })

/**
 * @param {(string|number|boolean)[]} list
 * @param {{
 *  required?: boolean
 * }} [opts ]
 * @returns {ValidationFn}
 */
export const enumT = (list, opts) => {
  const { required = false } = opts || {}
  if (!Array.isArray(list) || list.length === 0) {
    throw TypeError('array expected')
  }

  const _enumT = (v, e = {}) => {
    if (!required && v === undefined) {
      return true
    }
    if (!list.includes(v)) {
      e.message = 'not an enum value'
      return false
    }
    return true
  }

  Object.assign(_enumT, { ...opts, list, type: 'enum' })
  return _enumT
}

/**
 * @param {ValidationFn} schema
 * @param {{
 *  required?: boolean
 *  min?: number
 *  max?: number
 *  validate?: (v: any[], e: ValidationFailure) => boolean
 * }} [opts]
 * @returns {(v: any, e: ValidationFailure) => boolean}
 */
export const arrayT = (schema, opts) => {
  const { required = false, min = 0, max = 255, validate } = opts || {}
  if (min < 0 || max < 0 || min > max) {
    throw RangeError('min, max issue')
  }
  if (typeof schema !== 'function') {
    throw TypeError('function expected')
  }

  const _arrayT = (v, e = {}) => {
    if (!required && v === undefined) {
      return true
    }
    if (!Array.isArray(v)) {
      e.message = 'no an array'
      return false
    }
    if (v.length < min) {
      e.message = `array too short min=${min}`
      return false
    }
    if (v.length > max) {
      e.message = `array too long max=${max}`
      return false
    }

    for (let i = 0; i < v.length; i++) {
      const item = v[i]
      if (!schema(item, e)) {
        e.path = [...(e.path || []), String(i)]
        return false
      }
    }
    if (validate && !validate(v, e)) {
      e.message = e.message || 'array validate failed'
      return false
    }
    return true
  }

  Object.assign(_arrayT, { ...opts, schema, type: 'array' })
  return _arrayT
}

/**
 * @param {{[key: string]: ValidationFn}} schema
 * @param {{
 *  required?: boolean
 *  min?: number
 *  max?: number
 *  additionalProperties?: boolean
 *  validate?: (v: object, e?: ValidationFailure) => boolean
 * }} [opts]
 * @returns {ValidationFn}
 */
export const objectT = (schema, opts) => {
  const {
    required = false,
    additionalProperties = false,
    min = 0,
    max = 255,
    validate
  } = opts || {}
  if (!schema || typeof schema !== 'object') {
    throw TypeError('schema object expected')
  }
  if (min < 0 || max < 0 || min > max) {
    throw RangeError('min, max issue')
  }

  const _objectT = (v, e = {}) => {
    if (!required && (v === undefined || v === null)) {
      return true
    }
    if (v === null || typeof v !== 'object') {
      e.message = 'not an object'
      return false
    }
    const vProps = Object.keys(v)
    if (min !== undefined && vProps.length < min) {
      e.message = `object has less than ${min} properties`
      return false
    }
    if (max !== undefined && vProps.length > max) {
      e.message = `object has more than ${max} properties`
      return false
    }
    if (!additionalProperties) {
      for (const prop of Object.keys(schema)) {
        if (!vProps.includes(prop) && !schema[prop](undefined)) {
          e.message = `object has missing key=${prop}`
          return false
        }
      }
    }

    e.path = e.path || []
    const allProps = [...new Set([...Object.keys(schema), ...vProps])]
    for (const prop of allProps) {
      if (additionalProperties && !(prop in schema)) {
        e.additionalProps = e.additionalProps || []
        e.additionalProps.push([...e.path, prop])
        continue
      }
      if (!schema[prop]) {
        e.message = `object has additional key=${prop}`
        return false
      }
      e.path.push(prop)
      if (!schema[prop](v[prop], e)) {
        return false
      }
      e.path.pop()
    }
    if (validate && !validate(v, e)) {
      e.message = e.message || 'object validate failed'
      return false
    }
    return true
  }

  Object.assign(_objectT, { ...opts, schema, type: 'object' })
  return _objectT
}

/**
 * Data must be valid against exactly one of the given schemas.
 * @param {ValidationFn[]} schemas
 * @returns {ValidationFn}
 */
export function oneOf (schemas) {
  if (!Array.isArray(schemas)) {
    throw TypeError('schema array expected')
  }

  const _oneOf = (v, e = {}) => {
    let matched = 0
    for (const schema of schemas) {
      if (schema(v)) {
        matched++
      }
    }
    if (matched === 1) {
      return true
    }
    e.message = `oneOf failed, matches ${matched} schemas`
    return false
  }

  Object.assign(_oneOf, { schemas, type: 'oneOf' })
  return _oneOf
}

/**
 * Data must be valid against any (one or more) of the given schemas
 * @param {ValidationFn[]} schemas
 * @returns {ValidationFn}
 */
export function anyOf (schemas) {
  if (!Array.isArray(schemas)) {
    throw TypeError('schema array expected')
  }

  const _anyOf = (v, e = {}) => {
    const path = [...(e.path || [])]
    for (const schema of schemas) {
      const _e = { path: [...path] }
      if (schema(v, _e)) {
        Reflect.deleteProperty(e, 'failures')
        return true
      }
      e.failures = e.failures || []
      e.failures.push(_e)
    }
    e.message = 'anyOf failed'
    return false
  }

  Object.assign(_anyOf, { schemas, type: 'anyOf' })
  return _anyOf
}

/**
 * not() turns an allow-list into a block-list.
 * This is explicitly not supported here as to enforce secure defaults.
 * If you know what you do, write your own not().
 */
export function not () {
  throw Error('"not()" may become a security nightmare... Avoid it.')
}

/**
 * exporting the types only
 * @example
 * ```js
 * import { types as t } from '@veloze/validate
 * const schema = t.object({
 *  num: t.number(),
 *  str: t.string()
 * })
 * const valid = schema({ num: 1 })
 * ```
 */
export const type = {
  boolean: booleanT,
  number: numberT,
  integer: integerT,
  string: stringT,
  stringUrl: stringUrlT,
  stringDateTime: stringDateTimeT,
  stringUuid: stringUuidT,
  date: dateT,
  enum: enumT,
  array: arrayT,
  object: objectT
}
