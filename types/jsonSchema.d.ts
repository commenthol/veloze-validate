export function json(v: any): any;
export function toJsonSchema(schema: ValidationFn | any): object;
export type ValidationFn = import('./validate.js').ValidationFn;
