/**
 * cast values by schema
 * @param {ValidationFn | any} schema
 * @param {ValidationFn | any} [other]
 * @returns {(any) => any}
 */
export function cast(schema: ValidationFn | any, other?: ValidationFn | any): (any: any) => any;
export type ValidationFn = import('./validate.js').ValidationFn;
