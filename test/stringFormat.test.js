import fs from 'fs'
import yaml from 'js-yaml'
import { equal, deepEqual } from 'assert/strict'
import { stringFormatT, cast } from '../src/index.js'

const emailFixtures = yaml.load(
  fs.readFileSync(new URL('./fixtures/email.yaml', import.meta.url), 'utf-8')
)
const hostnameFixtures = yaml.load(
  fs.readFileSync(new URL('./fixtures/hostname.yaml', import.meta.url), 'utf-8')
)

describe('stringFormatT', function () {
  describe('url validation', function () {
    it('shall validate', function () {
      equal(
        stringFormatT().url().validate('https://foo.bar/path?a=1?b=2'),
        true
      )
      const e = {}
      equal(stringFormatT().url().validate('/foo.bar/path', e), false)
      deepEqual(e, { message: 'string is not an url' })
    })
  })

  describe('uuid validation', function () {
    it('shall validate', function () {
      equal(
        stringFormatT().uuid().validate('641663d3-4689-4ab0-842d-11fe8bfcfb17'),
        true
      )
      const e = {}
      equal(
        stringFormatT()
          .uuid()
          .validate('641663d3-4689-4ab0-842x-11fe8bfcfb17', e),
        false
      )
      deepEqual(e, { message: 'string is not an uuid' })
    })
  })

  describe('ipv4 validation', function () {
    const testsOk = [
      '127.0.0.1',
      '10.0.0.1',
      '192.168.1.1',
      '0.0.0.0',
      '255.255.255.255'
    ]
    testsOk.forEach((ip) => {
      it('shall pass ' + ip, function () {
        equal(stringFormatT().ipv4().validate(ip), true)
      })
    })

    const testsFail = [
      '10002.3.4',
      '1.2.3.4.5',
      '256.0.0.0',
      '260.0.0.0'
    ]
    testsFail.forEach((ip) => {
      it('shall fail ' + ip, function () {
        const e = {}
        equal(stringFormatT().ipv4().validate(ip, e), false)
        deepEqual(e, { message: 'string is not an ipv4' })
      })
    })
  })

  describe('ipv6 validation', function () {
    const testsOk = [
      '1:2:3:4:5:6:7:8',
      '::ffff:10.0.0.1',
      '::ffff:1.2.3.4',
      '::ffff:0.0.0.0',
      '1:2:3:4:5:6:77:88',
      '::ffff:255.255.255.255',
      'fe08::7:8',
      'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '1::',
      '1:2:3:4:5:6:7::',
      '1::8',
      '1:2:3:4:5:6::8',
      '1:2:3:4:5:6::8',
      '1::7:8',
      '1:2:3:4:5::7:8',
      '1:2:3:4:5::8',
      '1::6:7:8',
      '1:2:3:4::6:7:8',
      '1:2:3:4::8',
      '1::5:6:7:8',
      '1:2:3::5:6:7:8',
      '1:2:3::8',
      '1::4:5:6:7:8',
      '1:2::4:5:6:7:8',
      '1:2::8',
      '1::3:4:5:6:7:8',
      '1::3:4:5:6:7:8',
      '1::8',
      '::2:3:4:5:6:7:8',
      '::2:3:4:5:6:7:8',
      '::8',
      '::',
      'fe80::7:8%eth0',
      'fe80::7:8%1',
      '::255.255.255.255',
      '::ffff:255.255.255.255',
      '::ffff:0:255.255.255.255',
      '2001:db8:3:4::192.0.2.33',
      '64:ff9b::192.0.2.33'
    ]
    testsOk.forEach((ip) => {
      it('shall pass ' + ip, function () {
        equal(stringFormatT().ipv6().validate(ip), true)
      })
    })

    const testsFail = [
      '1:2:3:4:5:6:7:8:9',
      '1:2:3:4:5:6::7:8',
      ':1:2:3:4:5:6:7:8',
      '1:2:3:4:5:6:7:8:',
      '::1:2:3:4:5:6:7:8',
      '1:2:3:4:5:6:7:8::',
      '1:2:3:4:5:6:7:88888',
      '1::2::3',
      '2001:db8:3:4:5::192.0.2.33',
      'fe08::7:8%',
      'fe08::7:8i',
      'fe08::7:8interface'
    ]
    testsFail.forEach((ip) => {
      it('shall fail ' + ip, function () {
        const e = {}
        equal(stringFormatT().ipv6().validate(ip, e), false)
        deepEqual(e, { message: 'string is not an ipv6' })
      })
    })
  })

  describe('dateTime validation', function () {
    it('shall validate', function () {
      equal(stringFormatT().dateTime().validate('2020-12-01T12:01:02Z'), true)
      const e = {}
      equal(stringFormatT().dateTime().validate('/foo.bar/path', e), false)
      deepEqual(e, { message: 'string is not a date-time' })
    })

    it('shall cast to date', function () {
      deepEqual(
        cast(stringFormatT().dateTime().cast())('2020-12-01T12:01:02Z'),
        new Date('2020-12-01T12:01:02Z')
      )

      deepEqual(
        cast(stringFormatT().dateTime().cast())('2020-12-01'),
        new Date('2020-12-01T00:00:00.000Z')
      )
    })
  })

  describe('date validation', function () {
    it('shall validate', function () {
      equal(stringFormatT().date().validate('2020-12-01'), true)
      const e = {}
      equal(stringFormatT().date().validate('/foo.bar/path', e), false)
      deepEqual(e, { message: 'string is not a date' })
    })
  })

  describe('time validation', function () {
    it('shall validate', function () {
      equal(stringFormatT().time().validate('16:39:57-08:00'), true)
      const e = {}
      equal(stringFormatT().time().validate('/foo.bar/path', e), false)
      deepEqual(e, { message: 'string is not a time' })
    })
  })

  describe('regex validation', function () {
    it('shall validate', function () {
      equal(stringFormatT().regex().validate('closed (?:group)'), true)
      const e = {}
      equal(stringFormatT().regex().validate('unclosed (?:group', e), false)
      deepEqual(e, { message: 'string is not a regex' })
    })
  })

  describe('email validation', function () {
    emailFixtures.forEach(({ test, mail, err, opts, only }) => {
      const fn = only ? it.only : it
      fn(test || JSON.stringify(mail), function () {
        const e = {}
        const actual = stringFormatT().required().email(opts).validate(mail, e)
        equal(actual, !err)
        // console.log(e)
        e.message && equal(e.message, err)
      })
    })
  })

  describe('hostname validation', function () {
    hostnameFixtures.forEach(({ test, host, err, opts, max = 255, only }) => {
      const fn = only ? it.only : it
      fn(test || JSON.stringify(host), function () {
        const e = {}
        const actual = stringFormatT()
          .required()
          .hostname(opts)
          .max(max)
          .validate(host, e)
        equal(actual, !err)
        // console.log(e)
        e.message && equal(e.message, err)
      })
    })
  })
})
