// Common Types
export type UserRole = 'client' | 'writer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
  loading: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

// Component Props Types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface SearchConfig {
  placeholder: string;
  categories: {
    icon: React.ElementType;
    label: string;
    color: string;
  }[];
}

export interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
}