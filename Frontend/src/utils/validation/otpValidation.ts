import { ValidationResult } from './phoneValidation';

export function validateOtp(rawOtp: string, expectedLength: number = 6): ValidationResult {
  const clean = rawOtp.replace(/\D/g, '');

  if (!clean) {
    return {
      isValid: false,
      error: 'Please enter the verification OTP.',
      value: '',
    };
  }

  if (clean.length !== expectedLength) {
    return {
      isValid: false,
      error: `Please enter a complete ${expectedLength}-digit OTP.`,
      value: clean,
    };
  }

  return {
    isValid: true,
    value: clean,
  };
}
