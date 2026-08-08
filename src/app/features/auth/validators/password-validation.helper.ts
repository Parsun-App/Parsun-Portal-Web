const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 100;
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const DIGIT_PATTERN = /[0-9]/;
const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export function getPasswordError(value: string, rif: string | null): string {
  if (!value) return '';
  if (rif && value === rif) return '';
  if (value.length < PASSWORD_MIN_LENGTH) return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
  if (value.length > PASSWORD_MAX_LENGTH) return `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres`;
  if (!UPPERCASE_PATTERN.test(value)) return 'La contraseña debe contener: letra mayúscula';
  if (!LOWERCASE_PATTERN.test(value)) return 'La contraseña debe contener: letra minúscula';
  if (!DIGIT_PATTERN.test(value)) return 'La contraseña debe contener: número';
  if (!SPECIAL_CHAR_PATTERN.test(value)) return 'La contraseña debe contener: carácter especial';
  return '';
}
