import { ValidationResult } from './phoneValidation';

export function validateName(rawName: string): ValidationResult {
  const trimmed = rawName.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please enter your full name.',
      value: '',
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters.',
      value: trimmed,
    };
  }

  return {
    isValid: true,
    value: trimmed,
  };
}
