/**
 * Data must be valid against exactly one of the given schemas.
 * @param {ValidationFn[]} schemas
 * @returns {ValidationFn}
 */
export function oneOf(schemas: ValidationFn[]): ValidationFn;
/**
 * Data must be valid against any (one or more) of the given schemas
 * @param {ValidationFn[]} schemas
 * @returns {ValidationFn}
 */
export function anyOf(schemas: ValidationFn[]): ValidationFn;
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
export function booleanT(opts?: {
    required?: boolean | undefined;
    cast?: boolean | undefined;
    validate?: ((v: boolean, e?: ValidationFailure) => boolean) | undefined;
} | undefined): ValidationFn;
export function numberT(opts?: {
    required?: boolean | undefined;
    cast?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    exclusiveMin?: boolean | undefined;
    exclusiveMax?: boolean | undefined;
    validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined;
} | undefined): ValidationFn;
export function integerT(opts?: {
    required?: boolean | undefined;
    cast?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    exclusiveMin?: boolean | undefined;
    exclusiveMax?: boolean | undefined;
    validate?: ((v: number, e?: ValidationFailure) => boolean) | undefined;
} | undefined): ValidationFn;
export function dateT(opts?: {
    required?: boolean | undefined;
    min?: string | number | Date | undefined;
    max?: string | number | Date | undefined;
    exclusiveMin?: boolean | undefined;
    exclusiveMax?: boolean | undefined;
    validate?: ((v: Date, e?: ValidationFailure) => boolean) | undefined;
} | undefined): (v: any, e: ValidationFailure) => boolean;
export function stringT(opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    pattern?: RegExp | undefined;
    validate?: ((v: string, e?: ValidationFailure) => boolean) | undefined;
} | undefined): (v: any, e: ValidationFailure) => boolean;
export function validateUrl(string: string, e?: ValidationFailure | undefined): boolean;
export function stringUrlT(opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
} | undefined): (v: any, e: ValidationFailure) => boolean;
export function validateDateTime(string: string, e?: ValidationFailure | undefined): boolean;
export function stringDateTimeT(opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
} | undefined): (v: any, e: ValidationFailure) => boolean;
export function validateUuid(string: string, e?: ValidationFailure | undefined): boolean;
export function stringUuidT(opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
} | undefined): (v: any, e: ValidationFailure) => boolean;
export function enumT(list: (string | number | boolean)[], opts?: {
    required?: boolean | undefined;
} | undefined): ValidationFn;
export function arrayT(schema: ValidationFn, opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    validate?: ((v: any[], e: ValidationFailure) => boolean) | undefined;
} | undefined): (v: any, e: ValidationFailure) => boolean;
export function objectT(schema: {
    [key: string]: ValidationFn;
}, opts?: {
    required?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
    additionalProperties?: boolean | undefined;
    validate?: ((v: object, e?: ValidationFailure) => boolean) | undefined;
} | undefined): ValidationFn;
export namespace type {
    export { booleanT as boolean };
    export { numberT as number };
    export { integerT as integer };
    export { stringT as string };
    export { stringUrlT as stringUrl };
    export { stringDateTimeT as stringDateTime };
    export { stringUuidT as stringUuid };
    export { dateT as date };
    export { enumT as enum };
    export { arrayT as array };
    export { objectT as object };
}
export type ValidationFailure = {
    message?: string;
    path?: string[];
    failures?: ValidationFailure[];
    additionalProps?: string[][];
};
export type ValidationFn = (v: any, e?: ValidationFailure) => boolean;
