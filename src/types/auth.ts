export type UserRole = 'client' | 'writer' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface AuthError {
  message: string;
  status?: number;
}