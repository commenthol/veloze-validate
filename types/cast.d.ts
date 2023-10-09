/**
 * cast values by schema
 * @param {ValidationFn | any} schema
 * @returns {(any) => any}
 */
export function cast(schema: ValidationFn | any): (any: any) => any;
export type ValidationFn = import('./validate.js').ValidationFn;
