/**
 * formatted string utilities
 */
export class StringFormatT extends StringT {
    /**
     * validates url
     * @returns {this}
     */
    url(): this;
    format: string | undefined;
    /**
     * validate uuid; does not check on uuid version byte
     * @returns {this}
     */
    uuid(): this;
    _minLength: any;
    _maxLength: any;
    /**
     * expects string to be a date
     * @returns {this}
     */
    dateTime(): this;
    /**
     * expects string to be a ISO 8601 date e.g. `2018-11-13`
     * @returns {this}
     */
    date(): this;
    /**
     * expects string to be a ISO 8601 time e.g. `20:20:39+00:00`
     * @see https://datatracker.ietf.org/doc/html/rfc3339#section-5.6
     * @returns {this}
     */
    time(): this;
    /**
     * expects string to be a valid ECMA-262 regex
     * @returns {this}
     */
    regex(): this;
    /**
     * expects string to be a IPv4 address
     * @returns {this}
     */
    ipv4(): this;
    /**
     * expects string to be a IPv6 address
     * @returns {this}
     */
    ipv6(): this;
    /**
     * RFC6531 or RFC5321 (ascii=true) email validation
     * @note No support for quoted emails
     * @param {EmailDomainValidationOptions} [options]
     * @returns {this}
     */
    email(options?: EmailDomainValidationOptions | undefined): this;
    /**
     * RFC5890 or RFC1123 (ascii=true) Hostname validation
     * @param {EmailDomainValidationOptions} [options]
     * @returns {this}
     */
    hostname(options?: EmailDomainValidationOptions | undefined): this;
}
export function stringFormatT(opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    pattern?: RegExp | undefined;
    validate?: ((v: string, e?: ValidationFailure) => boolean) | undefined;
} | undefined): StringFormatT;
export const t: {
    string: (opts?: {
        required?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        pattern?: RegExp | undefined;
        validate?: ((v: string, e?: ValidationFailure) => boolean) | undefined;
    } | undefined) => StringFormatT;
    boolean: (opts?: {
        required?: boolean | undefined;
        cast?: boolean | undefined;
        validate?: ((v: number, e?: import("./validate.js").ValidationFailure | undefined) => boolean) | undefined;
    } | undefined) => import("./validate.js").BooleanT;
    number: (opts?: {
        required?: boolean | undefined;
        cast?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        exclusiveMin?: boolean | undefined;
        exclusiveMax?: boolean | undefined;
        validate?: ((v: number, e?: import("./validate.js").ValidationFailure | undefined) => boolean) | undefined;
    } | undefined) => import("./validate.js").NumberT;
    integer: (opts?: {
        required?: boolean | undefined;
        cast?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        exclusiveMin?: boolean | undefined;
        exclusiveMax?: boolean | undefined;
        validate?: ((v: number, e?: import("./validate.js").ValidationFailure | undefined) => boolean) | undefined;
    } | undefined) => import("./validate.js").IntegerT;
    date: (opts?: {
        required?: boolean | undefined;
        min?: string | number | Date | undefined;
        max?: string | number | Date | undefined;
        exclusiveMin?: boolean | undefined;
        exclusiveMax?: boolean | undefined;
        validate?: ((v: number | Date, e?: import("./validate.js").ValidationFailure | undefined) => boolean) | undefined;
    } | undefined) => import("./validate.js").DateT;
    enum: (list: (string | number | boolean)[], opts?: {
        required?: boolean | undefined;
    } | undefined) => import("./validate.js").EnumT;
    array: (schema: import("./validate.js").BaseT, opts?: {
        required?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        validate?: ((v: any[], e: import("./validate.js").ValidationFailure) => boolean) | undefined;
    } | undefined) => import("./validate.js").ArrayT;
    object: (schema: {
        [key: string]: import("./validate.js").BaseT;
    }, opts?: {
        required?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        additionalProperties?: boolean | undefined;
        validate?: ((v: any, e?: import("./validate.js").ValidationFailure | undefined) => boolean) | undefined;
    } | undefined) => import("./validate.js").ObjectT;
    instance: (instance: any, opts?: {
        required?: boolean | undefined;
        validate?: ((v: any, e?: import("./validate.js").ValidationFailure | undefined) => boolean) | undefined;
    } | undefined) => import("./validate.js").InstanceT;
    oneOf: (schemas: import("./validate.js").BaseT[]) => import("./validate.js").OneOf;
    anyOf: (schemas: import("./validate.js").BaseT[]) => import("./validate.js").AnyOf;
    allOf: (schemas: import("./validate.js").BaseT[]) => import("./validate.js").AllOf;
};
export function validateUrl(string: string, e?: import("./validate.js").ValidationFailure | undefined): boolean;
export function validateUuid(string: string, e?: import("./validate.js").ValidationFailure | undefined): boolean;
export function validateDateTime(string: string, e?: import("./validate.js").ValidationFailure | undefined): boolean;
export function validateDate(string: string, e?: import("./validate.js").ValidationFailure | undefined): boolean;
export function validateTime(string: string, e?: import("./validate.js").ValidationFailure | undefined): boolean;
export function validateRegex(string: string, e?: import("./validate.js").ValidationFailure | undefined): boolean;
export function validateIPv4(string: string, e?: import("./validate.js").ValidationFailure | undefined): boolean;
export function validateIPv6(string: string, e?: import("./validate.js").ValidationFailure | undefined): boolean;
export function validateEmail(options?: EmailDomainValidationOptions | undefined): ValidationFn;
export function validateHostname(options?: EmailDomainValidationOptions | undefined): ValidationFn;
export type ValidationFailure = import('./validate').ValidationFailure;
export type ValidationFn = import('./validate').ValidationFn;
export type EmailDomainValidationOptions = {
    ascii?: boolean | undefined;
    minDomainSegments?: number | undefined;
};
import { StringT } from './validate.js';
