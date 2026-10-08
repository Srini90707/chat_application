import { normalizePhoneNumber, validatePhoneNumber } from '../phoneUtils';

export interface ValidationResult<T = string> {
  isValid: boolean;
  error?: string;
  value: T;
}

export function validatePhone(rawNumber: string): ValidationResult {
  const normalized = normalizePhoneNumber(rawNumber);

  if (!rawNumber.trim()) {
    return {
      isValid: false,
      error: 'Please enter your mobile number.',
      value: '',
    };
  }

  if (!validatePhoneNumber(rawNumber)) {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit Indian mobile number.',
      value: normalized,
    };
  }

  return {
    isValid: true,
    value: normalized,
  };
}
