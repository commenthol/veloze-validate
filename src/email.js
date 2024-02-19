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
