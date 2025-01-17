/**
 * @typedef {{
 *  message?: string
 *  path?: string[]
 *  failures?: ValidationFailure[],
 *  additionalProps?: string[][]
 * }} ValidationFailure
 */
/** @typedef {(v: any, e?: ValidationFailure) => boolean} ValidationFn */

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
 * @typedef {{
 *  required?: boolean
 *  cast?: boolean
 *  validate?: (v: any, e?: ValidationFailure) => boolean
 *  min?: number
 *  max?: number
 *  exclusiveMin?: boolean
 *  exclusiveMax?: boolean
 * }} Options
 */

/**
 * @param {object} that
 * @param {Options} [opts]
 */
function addOpts(that, opts) {
  for (const key of Object.keys(opts || {})) {
    // @ts-expect-error
    that[`_${key}`] = opts[key]
  }
}

export class ValidationError extends Error {
  /**
   * @param {ValidationFailure} e
   */
  constructor(e) {
    const message = e?.message || 'validation failed'
    super(message)
    this.path = e?.path
    this.failures = e?.failures
    this.additionalProps = e?.additionalProps
  }
}

export class BaseT {
  type = 'base'
  /** @type {boolean|undefined} */
  _required
  /** @type {boolean|undefined} */
  _cast
  /** @type {number|undefined} */
  _min
  /** @type {number|undefined} */
  _max
  /** @type {boolean|undefined} */
  _exclusiveMin
  /** @type {boolean|undefined} */
  _exclusiveMax
  /** @type {any} */
  _default

  /**
   * @protected
   * clone schema
   * @param {BaseT} T class
   * @param {...any} arg arguments
   */
  // @ts-expect-error
  _clone(T = BaseT, ...arg) {
    // @ts-expect-error
    const clone = new T(...arg)
    for (const [key, value] of Object.entries(this)) {
      if (key[0] !== '_') continue
      clone[key] = value
    }
    return clone
  }

  required() {
    this._required = true
    return this
  }

  cast() {
    this._cast = true
    return this
  }

  default(v) {
    const e = {}
    const val = typeof v === 'function' ? v() : v
    if (!this.validate(val, e)) {
      e.message = `default: ${e.message}`
      throw new ValidationError(e)
    }
    this._default = v
    return this
  }

  /**
   * @param {number} min
   * @returns {this}
   */
  min(min) {
    this._min = min
    return this
  }

  /**
   * @param {number} max
   * @returns {this}
   */
  max(max) {
    this._max = max
    return this
  }

  /**
   * @param {ValidationFn} validateFn
   * @returns {this}
   */
  custom(validateFn) {
    this._validate = validateFn
    return this
  }

  /**
   * @param {any} v
   * @param {ValidationFailure} [e]
   * @returns {boolean}
   */
  /* c8 ignore next 4 */
  // eslint-disable-next-line no-unused-vars
  validate(v, e = {}) {
    return false
  }

  /**
   * @param {any} v
   * @returns {ValidationError|null}
   */
  analyze(v) {
    const e = {}
    if (!this.validate(v, e)) {
      return new ValidationError(e)
    }
    return null
  }

  /**
   * @throws
   * @param {any} v
   */
  throws(v) {
    const e = {}
    if (!this.validate(v, e)) {
      throw new ValidationError(e)
    }
  }
}

export class BooleanT extends BaseT {
  type = 'boolean'
  /** @type {((v: boolean, e?: ValidationFailure) => boolean)|undefined} */
  // @ts-expect-error
  _validate

  /**
   * @param {{
   *  required?: boolean
   *  cast?: boolean
   *  validate?: (v: number, e?: ValidationFailure) => boolean
   * }} [opts]
   */
  constructor(opts) {
    super()
    addOpts(this, opts)
  }

  /**
   * clones the schema
   * @returns {BooleanT}
   */
  clone() {
    // @ts-expect-error
    return super._clone(BooleanT)
  }

  /**
   * @param {any} v
   * @param {ValidationFailure} [e]
   * @returns {boolean}
   */
  validate(v, e = {}) {
    const { _required, _cast, _validate } = this
    if (!_required && v === undefined) {
      return true
    }
    if (_cast && (v === 'true' || v === 'false')) {
      v = v === 'true'
    }
    if (typeof v !== 'boolean') {
      e.message = 'not a boolean'
      return false
    }
    if (_validate && !_validate(v, e)) {
      e.message = e.message || 'boolean validate failed'
      return false
    }
    return true
  }
}

/**
 * @param {{
 *  required?: boolean
 *  cast?: boolean
 *  validate?: (v: number, e?: ValidationFailure) => boolean
 * }} [opts]
 */
export const booleanT = (opts) => new BooleanT(opts)

export class NumberT extends BaseT {
  type = 'number'
  /** @type {((v: number, e?: ValidationFailure) => boolean)|undefined} */
  // @ts-expect-error
  _validate

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
   */
  constructor(opts) {
    super()
    addOpts(this, opts)
    const { _min, _max } = this
    // @ts-expect-error
    if (_min >= _max) {
      throw RangeError('min, max issue')
    }
  }

  /**
   * clones the schema
   * @returns {NumberT}
   */
  clone() {
    // @ts-expect-error
    return super._clone(NumberT)
  }

  validate(v, e = {}) {
    const {
      _required,
      _cast,
      _min,
      _max,
      _exclusiveMin,
      _exclusiveMax,
      _validate
    } = this
    if (!_required && v === undefined) {
      return true
    }
    if (_cast && typeof v === 'string' && !isNaN(Number(v))) {
      v = Number(v)
    }
    if (typeof v !== 'number') {
      e.message = 'not a number'
      return false
    }
    if (_min !== undefined && (_exclusiveMin ? v <= _min : v < _min)) {
      e.message = `number less ${_exclusiveMin ? 'equal ' : ''}than min=${_min}`
      return false
    }
    if (_max !== undefined && (_exclusiveMax ? v >= _max : v > _max)) {
      e.message = `number greater ${
        _exclusiveMax ? 'equal ' : ''
      }than max=${_max}`
      return false
    }
    if (_validate && !_validate(v, e)) {
      e.message = e.message || 'number validate failed'
      return false
    }
    return true
  }

  exclusiveMin() {
    this._exclusiveMin = true
    return this
  }

  exclusiveMax() {
    this._exclusiveMax = true
    return this
  }
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
 */
export const numberT = (opts) => new NumberT(opts)

export class IntegerT extends NumberT {
  type = 'integer'
  _min = Number.MIN_SAFE_INTEGER
  _max = Number.MAX_SAFE_INTEGER

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
   */
  constructor(opts) {
    super()
    addOpts(this, opts)
  }

  /**
   * clones the schema
   * @returns {IntegerT}
   */
  clone() {
    // @ts-expect-error
    return super._clone(IntegerT)
  }

  validate(v, e = {}) {
    const { _required } = this
    if (!_required && v === undefined) {
      return true
    }
    if (!super.validate(v, e)) {
      return false
    }
    if (!Number.isSafeInteger(v)) {
      e.message = 'not an integer'
      return false
    }
    return true
  }
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
 */
export const integerT = (opts) => new IntegerT(opts)

/**
 * @param {any} v
 * @returns {Date|undefined}
 */
export const toDate = (v) => v && new Date(v)

export class DateT extends NumberT {
  type = 'date'
  /** @type {((v: Date|number, e?: ValidationFailure) => boolean)|undefined} */
  // @ts-expect-error
  _validate

  /**
   * @param {{
   *  required?: boolean
   *  min?: Date | number | string
   *  max?: Date | number | string
   *  exclusiveMin?: boolean
   *  exclusiveMax?: boolean
   *  validate?: (v: Date|number, e?: ValidationFailure) => boolean
   * }} [opts]
   */
  constructor(opts) {
    super()
    // @ts-expect-error
    addOpts(this, opts)
    this._minMax()
  }

  _minMax(min, max) {
    const _min = toDate(min ?? this._min)
    const _max = toDate(max ?? this._max)

    if (_min && isNaN(_min.getTime())) {
      throw TypeError('min is not a date')
    }
    if (_max && isNaN(_max.getTime())) {
      throw TypeError('max is not a date')
    }
    if (_min && _max && _min > _max) {
      throw RangeError('min, max issue')
    }
    // @ts-expect-error
    this._min = _min
    // @ts-expect-error
    this._max = _max
    return this
  }

  /**
   * clones the schema
   * @returns {DateT}
   */
  clone() {
    // @ts-expect-error
    return super._clone(DateT)
  }

  validate(v, e = {}) {
    const {
      _required,
      /** @type {Date|undefined} */ _min,
      /** @type {Date|undefined} */ _max,
      _exclusiveMin,
      _exclusiveMax,
      _validate
    } = this
    if (!_required && v === undefined) {
      return true
    }

    if (!(v instanceof Date)) {
      e.message = 'not a Date'
      return false
    }
    // @ts-expect-error
    if (_min instanceof Date && (_exclusiveMin ? v <= _min : v < _min)) {
      e.message = `date less ${
        _exclusiveMin ? 'equal ' : ''
      }than min=${_min.toISOString()}`
      return false
    }
    // @ts-expect-error
    if (_max instanceof Date && (_exclusiveMax ? v >= _max : v > _max)) {
      e.message = `date greater ${
        _exclusiveMax ? 'equal ' : ''
      }than max=${_max.toISOString()}`
      return false
    }
    if (_validate && !_validate(v, e)) {
      e.message = e.message || 'date validate failed'
      return false
    }
    return true
  }

  /**
   * @override
   * @param {Date|number} min
   */
  min(min) {
    return this._minMax(min)
  }

  /**
   * @override
   * @param {Date|number} max
   */
  max(max) {
    return this._minMax(undefined, max)
  }
}

/**
 * @param {{
 *  required?: boolean
 *  min?: Date | number | string
 *  max?: Date | number | string
 *  exclusiveMin?: boolean
 *  exclusiveMax?: boolean
 *  validate?: (v: Date|number, e?: ValidationFailure) => boolean
 * }} [opts]
 */
export const dateT = (opts) => new DateT(opts)

/*
  for json schema formats see
  https://json-schema.org/understanding-json-schema/reference/string
*/

export class StringT extends BaseT {
  type = 'string'
  _min = 0
  _max = 255
  /** @type {RegExp|undefined} */
  _pattern = undefined
  /** @type {((v: string, e?: ValidationFailure) => boolean)|undefined} */
  _validate = undefined

  /**
   * @param {{
   *  required?: boolean
   *  min?: number
   *  max?: number
   *  pattern?: RegExp
   *  validate?: (v: string, e?: ValidationFailure) => boolean
   * }} [opts]
   */
  constructor(opts) {
    super()
    addOpts(this, opts)
    this._minMax()
    const { _pattern } = this
    if (_pattern && !(_pattern instanceof RegExp)) {
      throw TypeError('pattern not a regex')
    }
  }

  _minMax(min, max) {
    const _min = min ?? this._min
    const _max = max ?? this._max
    if (_min < 0 || _max < 0 || _min > _max) {
      throw RangeError('min, max issue')
    }
    this._min = _min
    this._max = _max
    return this
  }

  /**
   * clones the schema
   * @returns {StringT}
   */
  clone() {
    // @ts-expect-error
    return super._clone(StringT)
  }

  validate(v, e = {}) {
    const { _required, _min, _max, _pattern, _validate } = this
    if (!_required && (v === undefined || v === '')) {
      return true
    }
    if (typeof v !== 'string') {
      e.message = 'not a string'
      return false
    }
    if (v.length < _min) {
      e.message = `string too short min=${_min}`
      return false
    }
    if (v.length > _max) {
      e.message = `string too long max=${_max}`
      return false
    }
    if (_pattern && !_pattern.test(v)) {
      e.message = `string does not match pattern=${_pattern.source}`
      return false
    }
    if (_validate && !_validate(v, e)) {
      e.message = e.message || 'string validate failed'
      return false
    }
    return true
  }

  /**
   * @param {number} min
   */
  min(min) {
    return this._minMax(min)
  }

  /**
   * @param {number} max
   */
  max(max) {
    return this._minMax(undefined, max)
  }

  /**
   * @param {RegExp} pattern
   */
  pattern(pattern) {
    if (!(pattern instanceof RegExp)) {
      throw TypeError('pattern not a regex')
    }
    this._pattern = pattern
    return this
  }
}

/**
 * @param {{
 *  required?: boolean
 *  min?: number
 *  max?: number
 *  pattern?: RegExp
 *  validate?: (v: string, e?: ValidationFailure) => boolean
 * }} [opts]
 */
export const stringT = (opts) => new StringT(opts)

export class EnumT extends BaseT {
  type = 'enum'

  /**
   * @param {(string|number|boolean)[]} list
   * @param {{
   *  required?: boolean
   * }} [opts ]
   */
  constructor(list, opts) {
    super()
    addOpts(this, opts)

    if (!Array.isArray(list) || list.length === 0) {
      throw TypeError('array expected')
    }
    this._list = list
  }

  /**
   * clones the schema
   * @returns {EnumT}
   */
  clone() {
    // @ts-expect-error
    return super._clone(EnumT, this._list)
  }

  validate(v, e = {}) {
    const { _required, _list } = this
    if (!_required && v === undefined) {
      return true
    }
    if (!_list.includes(v)) {
      e.message = 'not an enum value'
      return false
    }
    return true
  }
}

/**
 * @param {(string|number|boolean)[]} list
 * @param {{
 *  required?: boolean
 * }} [opts ]
 */
export const enumT = (list, opts) => new EnumT(list, opts)

export class ArrayT extends BaseT {
  type = 'array'
  _min = 0
  _max = 255
  /** @type {((v: any[], e?: ValidationFailure) => boolean)|undefined} */
  _validate = undefined

  /**
   * @param {BaseT} schema
   * @param {{
   *  required?: boolean
   *  min?: number
   *  max?: number
   *  validate?: (v: any[], e: ValidationFailure) => boolean
   * }} [opts]
   */
  constructor(schema, opts) {
    super()
    // @ts-expect-error
    addOpts(this, opts)

    const { _min, _max } = this
    if (_min < 0 || _max < 0 || _min > _max) {
      throw RangeError('min, max issue')
    }
    if (!schema || typeof schema?.validate !== 'function') {
      throw TypeError('schema expected')
    }
    this._schema = schema
  }

  /**
   * clones the schema
   * @returns {ArrayT}
   */
  clone() {
    // @ts-expect-error
    return super._clone(ArrayT, this._schema)
  }

  validate(v, e = {}) {
    const { _required, _min, _max, _schema, _validate } = this
    if (!_required && v === undefined) {
      return true
    }
    if (!Array.isArray(v)) {
      e.message = 'not an array'
      return false
    }
    if (v.length < _min) {
      e.message = `array too short min=${_min}`
      return false
    }
    if (v.length > _max) {
      e.message = `array too long max=${_max}`
      return false
    }

    for (let i = 0; i < v.length; i++) {
      const item = v[i]
      if (!_schema.validate(item, e)) {
        e.path = [...(e.path || []), String(i)]
        return false
      }
    }
    if (_validate && !_validate(v, e)) {
      e.message = e.message || 'array validate failed'
      return false
    }
    return true
  }
}

/**
 * @param {BaseT} schema
 * @param {{
 *  required?: boolean
 *  min?: number
 *  max?: number
 *  validate?: (v: any[], e: ValidationFailure) => boolean
 * }} [opts]
 */
export const arrayT = (schema, opts) => new ArrayT(schema, opts)

export class ObjectT extends BaseT {
  type = 'object'
  _min = 0
  _max = 255
  /** @type {boolean|undefined} */
  _additionalProperties
  /** @type {((v: object, e?: ValidationFailure) => boolean)|undefined} */
  // @ts-expect-error
  _validate

  /**
   * @param {{[key: string]: BaseT}} schema
   * @param {{
   *  required?: boolean
   *  min?: number
   *  max?: number
   *  additionalProperties?: boolean
   *  validate?: (v: object, e?: ValidationFailure) => boolean
   * }} [opts]
   */
  constructor(schema, opts) {
    super()
    addOpts(this, opts)

    if (!schema || typeof schema !== 'object') {
      throw TypeError('schema object expected')
    }
    const { _min, _max } = this
    if (_min < 0 || _max < 0 || _min > _max) {
      throw RangeError('min, max issue')
    }
    this._schema = schema
  }

  /**
   * clones the schema
   * @returns {ObjectT}
   */
  clone() {
    // @ts-expect-error
    return super._clone(ObjectT, this._schema)
  }

  validate(v, e = {}) {
    const { _required, _min, _max, _additionalProperties, _schema, _validate } =
      this

    if (!_required && (v === undefined || v === null)) {
      return true
    }
    if (v === null || typeof v !== 'object') {
      e.message = 'not an object'
      return false
    }
    const vProps = Object.keys(v)
    if (_min !== undefined && vProps.length < _min) {
      e.message = `object has less than ${_min} properties`
      return false
    }
    if (_max !== undefined && vProps.length > _max) {
      e.message = `object has more than ${_max} properties`
      return false
    }
    if (!_additionalProperties) {
      for (const prop of Object.keys(_schema)) {
        if (!vProps.includes(prop) && !_schema[prop].validate(undefined)) {
          e.message = `object has missing key=${prop}`
          return false
        }
      }
    }

    e.path = e.path || []
    const allProps = [...new Set([...Object.keys(_schema), ...vProps])]
    for (const prop of allProps) {
      if (_additionalProperties && !(prop in _schema)) {
        e.additionalProps = e.additionalProps || []
        e.additionalProps.push([...e.path, prop])
        continue
      }
      if (!(prop in _schema)) {
        e.message = `object has additional key=${prop}`
        return false
      }
      e.path.push(prop)
      if (!_schema[prop].validate(v[prop], e)) {
        return false
      }
      e.path.pop()
    }
    if (_validate && !_validate(v, e)) {
      e.message = e.message || 'object validate failed'
      return false
    }
    return true
  }

  additionalProperties() {
    this._additionalProperties = true
    return this
  }
}

/**
 * @param {{[key: string]: BaseT}} schema
 * @param {{
 *  required?: boolean
 *  min?: number
 *  max?: number
 *  additionalProperties?: boolean
 *  validate?: (v: object, e?: ValidationFailure) => boolean
 * }} [opts]
 */
export const objectT = (schema, opts) => new ObjectT(schema, opts)

export class InstanceT extends BaseT {
  type = 'instance'

  constructor(instance, opts) {
    super()
    addOpts(this, opts)
    this._instance = instance
  }

  clone() {
    // @ts-expect-error
    return super._clone(InstanceT, this._instance)
  }

  validate(v, e = {}) {
    const { _required, _validate } = this
    if (!_required && v === undefined) {
      return true
    }
    if (!(v instanceof this._instance)) {
      e.message = `not an instance of ${this._instance?.name}`
      return false
    }
    if (_validate && !_validate(v, e)) {
      e.message = e.message || 'instance validate failed'
      return false
    }
    return true
  }
}

/**
 * @param {InstanceType<any>} instance
 * @param {{
 *  required?: boolean
 *  validate?: (v: object, e?: ValidationFailure) => boolean
 * }} [opts]
 */
export const instanceT = (instance, opts) => new InstanceT(instance, opts)

export class OneOf extends BaseT {
  type = 'oneOf'

  /**
   * Data must be valid against exactly one of the given schemas.
   * @param {BaseT[]} schemas
   */
  constructor(schemas) {
    if (!Array.isArray(schemas)) {
      throw TypeError('schema array expected')
    }
    super()
    this._schemas = schemas
  }

  /**
   * clones the schema
   * @returns {OneOf}
   */
  clone() {
    // @ts-expect-error
    return super._clone(OneOf, this._schemas)
  }

  validate(v, e = {}) {
    let matched = 0
    for (const schema of this._schemas) {
      if (schema.validate(v)) {
        matched++
      } else if (v === undefined && schema._required) {
        e.message = `oneOf failed, ${schema.type} required`
        return false
      }
    }
    const { _required, _validate } = this
    if (matched !== 1) {
      if (!_required && v === undefined) {
        return true
      }
      e.message = `oneOf failed, matches ${matched} schemas`
      return false
    }
    if (_validate && !_validate(v, e)) {
      e.message = e.message || 'oneOf validate failed'
      return false
    }
    return true
  }
}

/**
 * Data must be valid against exactly one of the given schemas.
 * @param {BaseT[]} schemas
 */
export const oneOf = (schemas) => new OneOf(schemas)

export class AnyOf extends BaseT {
  type = 'anyOf'

  /**
   * Data must be valid against any (one or more) of the given schemas
   * @param {BaseT[]} schemas
   */
  constructor(schemas) {
    if (!Array.isArray(schemas)) {
      throw TypeError('schema array expected')
    }
    super()
    this._schemas = schemas
  }

  /**
   * clones the schema
   * @returns {AnyOf}
   */
  clone() {
    // @ts-expect-error
    return super._clone(AnyOf, this._schemas)
  }

  validate(v, e = {}) {
    const path = [...(e.path || [])]
    for (const schema of this._schemas) {
      const _e = { path: [...path] }
      if (schema.validate(v, _e)) {
        Reflect.deleteProperty(e, 'failures')
        if (this._validate && !this._validate(v, e)) {
          e.message = e.message || 'anyOf validate failed'
          return false
        }
        return true
      }
      e.failures = e.failures || []
      e.failures.push(_e)
    }
    e.message = 'anyOf failed'
    return false
  }
}

/**
 * Data must be valid against any (one or more) of the given schemas
 * @param {BaseT[]} schemas
 */
export const anyOf = (schemas) => new AnyOf(schemas)

export class AllOf extends BaseT {
  type = 'allOf'

  /**
   * Data must be valid against all of the given schemas
   * @param {BaseT[]} schemas
   */
  constructor(schemas) {
    if (!Array.isArray(schemas)) {
      throw TypeError('schema array expected')
    }
    super()
    this._schemas = schemas
  }

  /**
   * clones the schema
   * @returns {AllOf}
   */
  clone() {
    // @ts-expect-error
    return super._clone(AllOf, this._schemas)
  }

  validate(v, e = {}) {
    const path = [...(e.path || [])]
    let cnt = 0
    for (const schema of this._schemas) {
      const _e = { path: [...path] }
      if (!schema.validate(v, _e)) {
        e.message = `allOf failed in schema[${cnt}]`
        e.failures = [_e]
        return false
      }
      cnt++
    }
    if (this._validate && !this._validate(v, e)) {
      e.message = e.message || 'allOf validate failed'
      return false
    }
    return true
  }
}

/**
 * Data must be valid against all of the given schemas
 * @param {BaseT[]} schemas
 */
export const allOf = (schemas) => new AllOf(schemas)

/**
 * exporting the types only
 * @example
 * ```js
 * import { t } from '@veloze/validate
 * const schema = t.object({
 *  num: t.number(),
 *  str: t.string()
 * })
 * const valid = schema({ num: 1 })
 * ```
 */
export const t = {
  boolean: booleanT,
  number: numberT,
  integer: integerT,
  string: stringT,
  date: dateT,
  enum: enumT,
  array: arrayT,
  object: objectT,
  instance: instanceT,
  oneOf,
  anyOf,
  allOf
}
