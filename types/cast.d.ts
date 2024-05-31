/**
 * cast values by schema
 * @param {ValidationFn | any} schema
 * @returns {(any) => any}
 */
export function cast(schema: ValidationFn | any): (any) => any;
export type BaseT = import('./validate.js').BaseT;
export type ValidationFn = import('./validate.js').ValidationFn;
