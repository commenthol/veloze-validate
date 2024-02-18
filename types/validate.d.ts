/**
 * not() turns an allow-list into a block-list.
 * This is explicitly not supported here as to enforce secure defaults.
 * If you know what you do, write your own not().
 */
export function not(): void;
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
export const REQUIRED: Readonly<{
    required: true;
}>;
/**
 * shortcut for { additionalProperties: true }
 * @example
 * ```js
 * const schema = objectT({ num: numberT() }, ADD_PROPS)
 * ```
 */
export const ADD_PROPS: Readonly<{
    additionalProperties: true;
}>;
export class ValidationError extends Error {
    /**
     * @param {ValidationFailure} e
     */
    constructor(e: ValidationFailure);
    path: string[] | undefined;
    failures: ValidationFailure[] | undefined;
}
export class BaseT {
    /** @type {boolean|undefined} */
    _required: boolean | undefined;
    /** @type {boolean|undefined} */
    _cast: boolean | undefined;
    /** @type {number|undefined} */
    _min: number | undefined;
    /** @type {number|undefined} */
    _max: number | undefined;
    /** @type {boolean|undefined} */
    _exclusiveMin: boolean | undefined;
    /** @type {boolean|undefined} */
    _exclusiveMax: boolean | undefined;
    /** @type {any} */
    _default: any;
    required(): this;
    cast(): this;
    default(v: any): this;
    /**
     * @param {number} min
     * @returns {this}
     */
    min(min: number): this;
    /**
     * @param {number} max
     * @returns {this}
     */
    max(max: number): this;
    /**
     * @param {ValidationFn} validateFn
     * @returns {this}
     */
    custom(validateFn: ValidationFn): this;
    _validate: ValidationFn | undefined;
    /**
     * @param {any} v
     * @param {ValidationFailure} [e]
     * @returns {boolean}
     */
    validate(v: any, e?: ValidationFailure | undefined): boolean;
    /**
     * @param {any} v
     * @returns {ValidationError|null}
     */
    analyze(v: any): ValidationError | null;
}
export class BooleanT extends BaseT {
    constructor(opts: any);
    type: string;
    /** @type {((v: boolean, e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: boolean, e?: ValidationFailure) => boolean) | undefined;
}
export function booleanT(opts?: {
    required?: boolean | undefined;
    cast?: boolean | undefined;
    validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined;
} | undefined): BooleanT;
export class NumberT extends BaseT {
    constructor(opts: any);
    type: string;
    /** @type {((v: number, e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: number, e?: ValidationFailure) => boolean) | undefined;
    validate(v: any, e?: {}): boolean;
    exclusiveMin(): this;
    exclusiveMax(): this;
}
export function numberT(opts?: {
    required?: boolean | undefined;
    cast?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    exclusiveMin?: boolean | undefined;
    exclusiveMax?: boolean | undefined;
    validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined;
} | undefined): NumberT;
export class IntegerT extends NumberT {
    _min: number;
    _max: number;
}
export function integerT(opts?: {
    required?: boolean | undefined;
    cast?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    exclusiveMin?: boolean | undefined;
    exclusiveMax?: boolean | undefined;
    validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined;
} | undefined): IntegerT;
export function toDate(v: any): Date | undefined;
export class DateT extends NumberT {
    /** @type {((v: Date, e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: Date, e?: ValidationFailure) => boolean) | undefined;
    _minMax(min: any, max: any): this;
    /**
     * @override
     * @param {Date|number} min
     */
    override min(min: Date | number): this;
    /**
     * @override
     * @param {Date|number} max
     */
    override max(max: Date | number): this;
}
export function dateT(opts?: {
    required?: boolean | undefined;
    min?: string | number | Date | undefined;
    max?: string | number | Date | undefined;
    exclusiveMin?: boolean | undefined;
    exclusiveMax?: boolean | undefined;
    validate?: ((v: Date, e?: ValidationFailure) => boolean) | undefined;
} | undefined): DateT;
export class StringT extends BaseT {
    constructor(opts: any);
    type: string;
    _min: number;
    _max: number;
    /** @type {RegExp|undefined} */
    _pattern: RegExp | undefined;
    /** @type {((v: string, e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: string, e?: ValidationFailure) => boolean) | undefined;
    _minMax(min: any, max: any): this;
    validate(v: any, e?: {}): boolean;
    /**
     * @param {number} min
     */
    min(min: number): this;
    /**
     * @param {number} max
     */
    max(max: number): this;
    url(): this;
    format: string | undefined;
    uuid(): this;
    _minLength: any;
    _maxLength: any;
    dateTime(): this;
    /**
     * @param {RegExp} pattern
     */
    pattern(pattern: RegExp): this;
}
export function stringT(opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    pattern?: RegExp | undefined;
    validate?: ((v: string, e?: ValidationFailure) => boolean) | undefined;
} | undefined): StringT;
export function validateUrl(string: string, e?: ValidationFailure | undefined): boolean;
export function validateDateTime(string: string, e?: ValidationFailure | undefined): boolean;
export function validateUuid(string: string, e?: ValidationFailure | undefined): boolean;
export class EnumT extends BaseT {
    constructor(list: any, opts: any);
    type: string;
    _list: any[];
    validate(v: any, e?: {}): boolean;
}
export function enumT(list: (string | number | boolean)[], opts?: {
    required?: boolean | undefined;
} | undefined): EnumT;
export class ArrayT extends BaseT {
    constructor(schema: any, opts: any);
    type: string;
    _min: number;
    _max: number;
    /** @type {((v: any[], e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: any[], e?: ValidationFailure) => boolean) | undefined;
    _schema: any;
    validate(v: any, e?: {}): boolean;
}
export function arrayT(schema: ValidationFn, opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    validate?: ((v: any[], e: ValidationFailure) => boolean) | undefined;
} | undefined): ArrayT;
export class ObjectT extends BaseT {
    constructor(schema: any, opts: any);
    type: string;
    _min: number;
    _max: number;
    /** @type {boolean|undefined} */
    _additionalProperties: boolean | undefined;
    _schema: any;
    validate(v: any, e?: {}): boolean;
    additionalProperties(): this;
}
export function objectT(schema: {
    [key: string]: BaseT;
}, opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    additionalProperties?: boolean | undefined;
    validate?: ((v: object, e?: ValidationFailure) => boolean) | undefined;
} | undefined): ObjectT;
export class OneOf {
    constructor(schemas: any);
    type: string;
    _schemas: any[];
    validate(v: any, e?: {}): boolean;
}
export function oneOf(schemas: BaseT[]): OneOf;
export class AnyOf {
    constructor(schemas: any);
    type: string;
    _schemas: any[];
    validate(v: any, e?: {}): boolean;
}
export function anyOf(schemas: BaseT[]): AnyOf;
export class AllOf {
    constructor(schemas: any);
    type: string;
    _schemas: any[];
    validate(v: any, e?: {}): boolean;
}
export function allOf(schemas: BaseT[]): AllOf;
export namespace type {
    export { booleanT as boolean };
    export { numberT as number };
    export { integerT as integer };
    export { stringT as string };
    export { dateT as date };
    export { enumT as enum };
    export { arrayT as array };
    export { objectT as object };
}
export type Options = {
    required?: boolean | undefined;
    cast?: boolean | undefined;
    validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined;
    min?: number | undefined;
    max?: number | undefined;
    exclusiveMin?: boolean | undefined;
    exclusiveMax?: boolean | undefined;
};
export type ValidationFailure = {
    message?: string;
    path?: string[];
    failures?: ValidationFailure[];
    additionalProps?: string[][];
};
export type ValidationFn = (v: any, e?: ValidationFailure) => boolean;
