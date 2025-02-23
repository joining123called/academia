import { ValidationResult } from '../types';

export const validatePassword = (password: string): ValidationResult => {
  const requirements = [
    { test: (p: string) => p.length >= 8, message: 'Password must be at least 8 characters long' },
    { test: (p: string) => /[A-Z]/.test(p), message: 'Password must contain at least one uppercase letter' },
    { test: (p: string) => /[a-z]/.test(p), message: 'Password must contain at least one lowercase letter' },
    { test: (p: string) => /\d/.test(p), message: 'Password must contain at least one number' },
    { test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p), message: 'Password must contain at least one special character' }
  ];

  for (const requirement of requirements) {
    if (!requirement.test(password)) {
      return { isValid: false, message: requirement.message };
    }
  }

  return { isValid: true, message: '' };
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
};

export const handleAuthError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please try again.';
    case 'Email not confirmed':
      return 'Please verify your email address before signing in.';
    case 'Email already registered':
      return 'This email is already registered. Please sign in instead.';
    default:
      return error.message;
  }
};