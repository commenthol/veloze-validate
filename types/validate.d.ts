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
    additionalProps: string[][] | undefined;
}
export class BaseT {
    type: string;
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
    /**
     * @protected
     * clone schema
     * @param {BaseT} T class
     * @param {...any} arg arguments
     */
    protected _clone(T?: BaseT, ...arg: any[]): any;
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
    /**
     * @throws
     * @param {any} v
     */
    throws(v: any): void;
}
export class BooleanT extends BaseT {
    /**
     * @param {{
     *  required?: boolean
     *  cast?: boolean
     *  validate?: (v: number, e?: ValidationFailure) => boolean
     * }} [opts]
     */
    constructor(opts?: {
        required?: boolean | undefined;
        cast?: boolean | undefined;
        validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined;
    } | undefined);
    /** @type {((v: boolean, e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: boolean, e?: ValidationFailure) => boolean) | undefined;
    /**
     * clones the schema
     * @returns {BooleanT}
     */
    clone(): BooleanT;
}
export function booleanT(opts?: {
    required?: boolean | undefined;
    cast?: boolean | undefined;
    validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined;
} | undefined): BooleanT;
export class NumberT extends BaseT {
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
    constructor(opts?: {
        required?: boolean | undefined;
        cast?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        exclusiveMin?: boolean | undefined;
        exclusiveMax?: boolean | undefined;
        validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined;
    } | undefined);
    /** @type {((v: number, e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: number, e?: ValidationFailure) => boolean) | undefined;
    /**
     * clones the schema
     * @returns {NumberT}
     */
    clone(): NumberT;
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
    /**
     * clones the schema
     * @returns {IntegerT}
     */
    clone(): IntegerT;
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
    constructor(opts?: {
        required?: boolean | undefined;
        min?: string | number | Date | undefined;
        max?: string | number | Date | undefined;
        exclusiveMin?: boolean | undefined;
        exclusiveMax?: boolean | undefined;
        validate?: ((v: Date | number, e?: ValidationFailure) => boolean) | undefined;
    } | undefined);
    /** @type {((v: Date|number, e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: Date | number, e?: ValidationFailure) => boolean) | undefined;
    _minMax(min: any, max: any): this;
    /**
     * clones the schema
     * @returns {DateT}
     */
    clone(): DateT;
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
    validate?: ((v: Date | number, e?: ValidationFailure) => boolean) | undefined;
} | undefined): DateT;
export class StringT extends BaseT {
    /**
     * @param {{
     *  required?: boolean
     *  min?: number
     *  max?: number
     *  pattern?: RegExp
     *  validate?: (v: string, e?: ValidationFailure) => boolean
     * }} [opts]
     */
    constructor(opts?: {
        required?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        pattern?: RegExp | undefined;
        validate?: ((v: string, e?: ValidationFailure) => boolean) | undefined;
    } | undefined);
    _min: number;
    _max: number;
    /** @type {RegExp|undefined} */
    _pattern: RegExp | undefined;
    /** @type {((v: string, e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: string, e?: ValidationFailure) => boolean) | undefined;
    _minMax(min: any, max: any): this;
    /**
     * clones the schema
     * @returns {StringT}
     */
    clone(): StringT;
    validate(v: any, e?: {}): boolean;
    /**
     * @param {number} min
     */
    min(min: number): this;
    /**
     * @param {number} max
     */
    max(max: number): this;
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
export class EnumT extends BaseT {
    /**
     * @param {(string|number|boolean)[]} list
     * @param {{
     *  required?: boolean
     * }} [opts ]
     */
    constructor(list: (string | number | boolean)[], opts?: {
        required?: boolean | undefined;
    } | undefined);
    _list: (string | number | boolean)[];
    /**
     * clones the schema
     * @returns {EnumT}
     */
    clone(): EnumT;
    validate(v: any, e?: {}): boolean;
}
export function enumT(list: (string | number | boolean)[], opts?: {
    required?: boolean | undefined;
} | undefined): EnumT;
export class ArrayT extends BaseT {
    /**
     * @param {BaseT} schema
     * @param {{
     *  required?: boolean
     *  min?: number
     *  max?: number
     *  validate?: (v: any[], e: ValidationFailure) => boolean
     * }} [opts]
     */
    constructor(schema: BaseT, opts?: {
        required?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        validate?: ((v: any[], e: ValidationFailure) => boolean) | undefined;
    } | undefined);
    _min: number;
    _max: number;
    /** @type {((v: any[], e?: ValidationFailure) => boolean)|undefined} */
    _validate: ((v: any[], e?: ValidationFailure) => boolean) | undefined;
    _schema: BaseT;
    /**
     * clones the schema
     * @returns {ArrayT}
     */
    clone(): ArrayT;
    validate(v: any, e?: {}): boolean;
}
export function arrayT(schema: BaseT, opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    validate?: ((v: any[], e: ValidationFailure) => boolean) | undefined;
} | undefined): ArrayT;
export class ObjectT extends BaseT {
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
    constructor(schema: {
        [key: string]: BaseT;
    }, opts?: {
        required?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        additionalProperties?: boolean | undefined;
        validate?: ((v: object, e?: ValidationFailure) => boolean) | undefined;
    } | undefined);
    _min: number;
    _max: number;
    /** @type {boolean|undefined} */
    _additionalProperties: boolean | undefined;
    _schema: {
        [key: string]: BaseT;
    };
    /**
     * clones the schema
     * @returns {ObjectT}
     */
    clone(): ObjectT;
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
export class InstanceT extends BaseT {
    constructor(instance: any, opts: any);
    _instance: any;
    clone(): any;
    validate(v: any, e?: {}): boolean;
}
export function instanceT(instance: InstanceType<any>, opts?: {
    required?: boolean | undefined;
    validate?: ((v: object, e?: ValidationFailure) => boolean) | undefined;
} | undefined): InstanceT;
export class OneOf extends BaseT {
    /**
     * Data must be valid against exactly one of the given schemas.
     * @param {BaseT[]} schemas
     */
    constructor(schemas: BaseT[]);
    _schemas: BaseT[];
    /**
     * clones the schema
     * @returns {OneOf}
     */
    clone(): OneOf;
    validate(v: any, e?: {}): boolean;
}
export function oneOf(schemas: BaseT[]): OneOf;
export class AnyOf extends BaseT {
    /**
     * Data must be valid against any (one or more) of the given schemas
     * @param {BaseT[]} schemas
     */
    constructor(schemas: BaseT[]);
    _schemas: BaseT[];
    /**
     * clones the schema
     * @returns {AnyOf}
     */
    clone(): AnyOf;
    validate(v: any, e?: {}): boolean;
}
export function anyOf(schemas: BaseT[]): AnyOf;
export class AllOf extends BaseT {
    /**
     * Data must be valid against all of the given schemas
     * @param {BaseT[]} schemas
     */
    constructor(schemas: BaseT[]);
    _schemas: BaseT[];
    /**
     * clones the schema
     * @returns {AllOf}
     */
    clone(): AllOf;
    validate(v: any, e?: {}): boolean;
}
export function allOf(schemas: BaseT[]): AllOf;
export namespace t {
    export { booleanT as boolean };
    export { numberT as number };
    export { integerT as integer };
    export { stringT as string };
    export { dateT as date };
    export { enumT as enum };
    export { arrayT as array };
    export { objectT as object };
    export { instanceT as instance };
    export { oneOf };
    export { anyOf };
    export { allOf };
}
export type Options = {
    required?: boolean;
    cast?: boolean;
    validate?: (v: any, e?: ValidationFailure) => boolean;
    min?: number;
    max?: number;
    exclusiveMin?: boolean;
    exclusiveMax?: boolean;
};
export type ValidationFailure = {
    message?: string;
    path?: string[];
    failures?: ValidationFailure[];
    additionalProps?: string[][];
};
export type ValidationFn = (v: any, e?: ValidationFailure) => boolean;
