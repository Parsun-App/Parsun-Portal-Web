import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PASSWORD_MIN_LENGTH = 8;
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const DIGIT_PATTERN = /[0-9]/;
const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export function passwordComplexityValidator(rifProvider: () => string | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const rif = rifProvider();
    if (rif && value === rif) return null;
    if (value.length < PASSWORD_MIN_LENGTH) return { minlength: { requiredLength: PASSWORD_MIN_LENGTH } };
    if (!UPPERCASE_PATTERN.test(value)) return { pattern: { requiredPattern: 'uppercase' } };
    if (!LOWERCASE_PATTERN.test(value)) return { pattern: { requiredPattern: 'lowercase' } };
    if (!DIGIT_PATTERN.test(value)) return { pattern: { requiredPattern: 'digit' } };
    if (!SPECIAL_CHAR_PATTERN.test(value)) return { pattern: { requiredPattern: 'specialChar' } };
    return null;
  };
}
