import { StringT, t as types } from './validate.js'

/*
 * for json schema formats see
 * https://json-schema.org/understanding-json-schema/reference/string
 */

/**
 * formatted string utilities
 */
export class StringFormatT extends StringT {
  /**
   * validates url
   * @returns {this}
   */
  url () {
    this._validate = validateUrl
    this.format = 'uri'
    return this
  }

  /**
   * validate uuid; does not check on uuid version byte
   * @returns {this}
   */
  uuid () {
    this._validate = validateUuid
    this.format = 'uuid'
    this._minLength = this._maxLength = undefined
    return this
  }

  /**
   * expects string to be a date
   * @returns {this}
   */
  dateTime () {
    this._validate = validateDateTime
    this.format = 'date-time'
    return this
  }

  /**
   * expects string to be a ISO 8601 date e.g. `2018-11-13`
   * @returns {this}
   */
  date () {
    this._validate = validateDate
    this.format = 'date'
    return this
  }

  /**
   * expects string to be a ISO 8601 time e.g. `20:20:39+00:00`
   * @see https://datatracker.ietf.org/doc/html/rfc3339#section-5.6
   * @returns {this}
   */
  time () {
    this._validate = validateTime
    this.format = 'date'
    return this
  }

  /**
   * expects string to be a valid ECMA-262 regex
   * @returns {this}
   */
  regex () {
    this._validate = validateRegex
    this.format = 'regex'
    return this
  }

  /**
   * expects string to be a IPv4 address
   * @returns {this}
   */
  ipv4 () {
    this._validate = validateIPv4
    this.format = 'ipv4'
    return this
  }

  /**
   * expects string to be a IPv6 address
   * @returns {this}
   */
  ipv6 () {
    this._validate = validateIPv6
    this.format = 'ipv4'
    return this
  }

  /**
   * RFC6531 or RFC5321 (ascii=true) email validation
   * @note No support for quoted emails
   * @param {EmailDomainValidationOptions} [options]
   * @returns {this}
   */
  email (options) {
    this._validate = validateEmail(options)
    this.format = options?.ascii ? 'email' : 'idn-email'
    return this
  }

  /**
   * RFC5890 or RFC1123 (ascii=true) Hostname validation
   * @param {EmailDomainValidationOptions} [options]
   * @returns {this}
   */
  hostname (options) {
    this._validate = validateHostname(options)
    this.format = options?.ascii ? 'hostname' : 'idn-hostname'
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
export const stringFormatT = (opts) => new StringFormatT(opts)

export const t = { ...types, string: stringFormatT }

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
 * a not so strict UUID check (does not check for uuid version byte)
 */
const RX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * @param {string} string
 * @param {ValidationFailure} [e]
 * @returns {boolean}
 */
export const validateUuid = (string, e = {}) => {
  if (string.length !== 36 || !RX_UUID.test(string)) {
    e.message = 'string is not an uuid'
    return false
  }
  return true
}

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

const RX_DATE = /^\d{4}-(?:0[1-9]|1[012])-(?:[012][1-9]|3[01])$/

/**
 * @param {string} string
 * @param {ValidationFailure} [e]
 * @returns {boolean}
 */
export const validateDate = (string, e = {}) => {
  if (!RX_DATE.test(string)) {
    e.message = 'string is not a date'
    return false
  }
  return true
}

const RX_TIME_H = '(?:[01][0-9]|2[0-3])'
const RX_TIME_M = '(?:[0-5][0-9])'
const RX_TIME = new RegExp(
  `^${RX_TIME_H}:${RX_TIME_M}:${RX_TIME_M}(?:[+-]${RX_TIME_H}:${RX_TIME_M}|)$`
)

/**
 * @param {string} string
 * @param {ValidationFailure} [e]
 * @returns {boolean}
 */
export const validateTime = (string, e = {}) => {
  if (!RX_TIME.test(string)) {
    e.message = 'string is not a time'
    return false
  }
  return true
}

/**
 * @param {string} string
 * @param {ValidationFailure} [e]
 * @returns {boolean}
 */
export const validateRegex = (string, e = {}) => {
  try {
    // eslint-disable-next-line no-new
    new RegExp(string)
    return true
  } catch (err) {
    e.message = 'string is not a regex'
  }
  return false
}

// @credits https://gist.github.com/syzdek/6086792
const IPV4SEG = '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])'
const IPV4ADDR = `(?:${IPV4SEG}\\.){3}${IPV4SEG}`
const RX_IPV4 = new RegExp(`^${IPV4ADDR}$`)
const IPV6SEG = '[0-9a-fA-F]{1,4}'
const IPV6ADDR = [
  '^(',
  '(IPV6SEG:){7,7}IPV6SEG|', //                  # 1:2:3:4:5:6:7:8
  '(IPV6SEG:){1,7}:|', //                        # 1::                                 1:2:3:4:5:6:7::
  '(IPV6SEG:){1,6}:IPV6SEG|', //                 # 1::8                1:2:3:4:5:6::8  1:2:3:4:5:6::8
  '(IPV6SEG:){1,5}(:IPV6SEG){1,2}|', //          # 1::7:8              1:2:3:4:5::7:8  1:2:3:4:5::8
  '(IPV6SEG:){1,4}(:IPV6SEG){1,3}|', //          # 1::6:7:8            1:2:3:4::6:7:8  1:2:3:4::8
  '(IPV6SEG:){1,3}(:IPV6SEG){1,4}|', //          # 1::5:6:7:8          1:2:3::5:6:7:8  1:2:3::8
  '(IPV6SEG:){1,2}(:IPV6SEG){1,5}|', //          # 1::4:5:6:7:8        1:2::4:5:6:7:8  1:2::8
  'IPV6SEG:((:IPV6SEG){1,6})|', //               # 1::3:4:5:6:7:8      1::3:4:5:6:7:8  1::8
  ':((:IPV6SEG){1,7}|:)|', //                    # ::2:3:4:5:6:7:8     ::2:3:4:5:6:7:8 ::8       ::
  'fe80:(:IPV6SEG){2,2}%[0-9a-zA-Z]{1,255}|', // # fe08::7:8%eth0      fe08::7:8%1                                      (link-local IPv6 addresses with zone index)
  '::(ffff(:0{1,4}){0,1}:){0,1}IPV4ADDR|', //    # ::255.255.255.255   ::ffff:255.255.255.255  ::ffff:0:255.255.255.255 (IPv4-mapped IPv6 addresses and IPv4-translated addresses)
  '(IPV6SEG:){1,4}:IPV4ADDR', //                 # 2001:db8:3:4::192.0.2.33  64:ff9b::192.0.2.33                        (IPv4-Embedded IPv6 Address)
  ')$'
]
  .join('')
  .replace(/IPV6SEG/g, IPV6SEG)
  .replace(/IPV4ADDR/g, IPV4ADDR)
const RX_IPV6 = new RegExp(IPV6ADDR)

/**
 * @param {string} string
 * @param {ValidationFailure} [e]
 * @returns {boolean}
 */
export const validateIPv4 = (string, e = {}) => {
  if (!RX_IPV4.test(string)) {
    e.message = 'string is not an ipv4'
    return false
  }
  return true
}

/**
 * @param {string} string
 * @param {ValidationFailure} [e]
 * @returns {boolean}
 */
export const validateIPv6 = (string, e = {}) => {
  if (!RX_IPV6.test(string)) {
    e.message = 'string is not an ipv6'
    return false
  }
  return true
}

/* eslint no-control-regex: off */

/** @typedef {import('./validate').ValidationFailure} ValidationFailure */
/** @typedef {import('./validate').ValidationFn} ValidationFn */
/**
 * @typedef {object} EmailDomainValidationOptions
 * @property {boolean} [ascii]
 * @property {number} [minDomainSegments=2]
 */

const RX_NON_ASCII = /[^\x00-\x7f]/

// https://tools.ietf.org/html/rfc5321#section-4.1.2
// https://tools.ietf.org/html/rfc5322#section-3.2.3
const RX_ATEXT = /^[\w!#$%&'*+-/=?^_`{|}~]{1,64}$/

// https://tools.ietf.org/html/rfc6531#section-3.3
// https://tools.ietf.org/html/rfc6532#section-3.1
// https://tools.ietf.org/html/rfc3629#section-4
const RX_UTF8_NON_ASCII = new RegExp(
  [
    // UTF8-2      = %xC2-DF UTF8-tail
    /(?:[\xc2-\xdf][\x80-\xbf])/,
    // UTF8-3      = %xE0 %xA0-BF UTF8-tail / %xE1-EC 2( UTF8-tail ) /
    //               %xED %x80-9F UTF8-tail / %xEE-EF 2( UTF8-tail )
    /(?:\xe0[\xa0-\xbf][\x80-\xbf])/,
    /(?:[\xe1-\xec][\x80-\xbf]{2})/,
    /(?:\xed[\x80-\x9f][\x80-\xbf])/,
    /(?:[\xee-\xef][\x80-\xbf]{2})/,
    // UTF8-4      = %xF0 %x90-BF 2( UTF8-tail ) / %xF1-F3 3( UTF8-tail ) /
    //               %xF4 %x80-8F 2( UTF8-tail )
    /(?:\xf0[\x90-\xbf][\x80-\xbf]{2})/,
    /(?:[\xf1-\xf3][\x80-\xbf]{3})/,
    /(?:\xf4[\x80-\x8f][\x80-\xbf]{2})/
  ]
    .map((rx) => rx.source)
    .join('|')
)

function toUtf8 (char) {
  return Array.from(new TextEncoder().encode(char), (v) =>
    String.fromCharCode(v)
  ).join('')
}

const msg = (e, msg) => {
  e.message = msg
  return false
}

/**
 * RFC6531 or RFC5321 (ascii=true) email validation
 * validation is used;
 * @note No support for quoted emails
 * @see https://tools.ietf.org/html/rfc6531
 * @see https://tools.ietf.org/html/rfc5321#section-4.1.2
 * @param {EmailDomainValidationOptions} [options]
 * @returns {ValidationFn}
 */
export const validateEmail =
  (options) =>
    (v, e = {}) => {
      const { ascii = false } = options || {}
      if (RX_NON_ASCII.test(v)) {
        if (ascii) {
          return msg(e, 'forbidden unicode')
        }
        v = v.normalize('NFC')
      }

      // http://tools.ietf.org/html/rfc5321#section-4.5.3.1.3
      if (new TextEncoder().encode(v).length > 254) {
        return msg(e, 'email too long')
      }

      const parts = v.split('@')
      if (parts.length < 2) {
        return msg(e, 'invalid email')
      }
      if (parts.length > 2) {
        return msg(e, 'multiple @ chars')
      }
      const [local, domain] = parts
      if (new TextEncoder().encode(local).length > 64) {
        return msg(e, 'local part too long')
      }

      const segments = local.split('.')
      for (const segment of segments) {
      // segment is in UTF-16
        if (!segment.length) {
          return msg(e, 'empty local segment')
        }
        for (const char of segment) {
          if (RX_ATEXT.test(char)) {
            continue
          }
          if (!RX_UTF8_NON_ASCII.test(toUtf8(char))) {
            return msg(e, 'invalid character')
          }
        }
      }
      if (!domain) {
        return msg(e, 'empty domain')
      }

      return validateHostname(options)(domain, e)
    }

// https://tools.ietf.org/html/rfc1035#section-2.3.1
const RX_DOMAIN_CHAR = /[A-Za-z0-9-]/
const RX_DOMAIN_INVALID_CHARS = /[\x00-\x20@:/\\#!$&'()*+,;=?]/
const RX_DOMAIN_INVALID_HYPHEN = /^-|(?<!^xn)--|-$/

/**
 * RFC5890 or RFC1123 (ascii=true) Hostname validation
 * @see https://tools.ietf.org/html/rfc1123#section-2.1
 * @see https://tools.ietf.org/html/rfc5890#section-2.3.2.3
 * @param {EmailDomainValidationOptions} [options]
 * @returns {ValidationFn}
 */
export const validateHostname =
  (options) =>
    (v, e = {}) => {
      const { ascii = false, minDomainSegments = 2 } = options || {}
      if (RX_NON_ASCII.test(v)) {
        if (ascii || /(^|\.)xn--/.test(v)) {
          return msg(e, 'forbidden unicode')
        }
        v = v.normalize('NFC')
      }
      if (RX_DOMAIN_INVALID_CHARS.test(v)) {
        return msg(e, 'invalid domain')
      }
      v = parseHost(v)
      if (!v) {
        return msg(e, 'invalid domain')
      }
      // https://tools.ietf.org/html/rfc5321#section-4.5.3.1.2
      if (v.length > 255) {
        return msg(e, 'domain too long')
      }

      const segments = v.split('.')
      if (segments.length < minDomainSegments) {
        return msg(e, `less than ${minDomainSegments} domain segments`)
      }
      for (const segment of segments) {
      // segment is in UTF-16
        if (!segment.length) {
          return msg(e, 'empty domain segment')
        }
        if (segment.length > 63) {
          return msg(e, 'domain segment too long')
        }
        if (RX_DOMAIN_INVALID_HYPHEN.test(segment)) {
          return msg(e, 'invalid domain characters')
        }
        for (const char of segment) {
          if (!RX_DOMAIN_CHAR.test(char)) {
            return msg(e, 'invalid domain character')
          }
        }
      }
      return true
    }

const parseHost = (v) => {
  try {
    return new URL(`http://${v}`).host
  } catch (e) {
    return ''
  }
}
