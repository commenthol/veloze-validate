export function validateEmail(options?: EmailDomainValidationOptions | undefined): ValidationFn;
export function validateHostname(options?: EmailDomainValidationOptions | undefined): ValidationFn;
export type ValidationFailure = import('./validate').ValidationFailure;
export type ValidationFn = import('./validate').ValidationFn;
export type EmailDomainValidationOptions = {
    ascii?: boolean | undefined;
    minDomainSegments?: number | undefined;
};
