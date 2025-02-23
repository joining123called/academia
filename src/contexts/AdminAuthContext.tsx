import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminSupabase, handleAuthError } from '../lib/supabase';
import type { AuthUser } from '../types/auth';
import { showAuthError, showAuthSuccess } from '../components/feedback/AuthFeedback';
import { validateEmail, validatePassword } from '../utils/validation';

interface AdminAuthContextType {
  admin: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await adminSupabase.auth.getSession();
        if (error) throw error;

        if (session?.user && session.user.user_metadata.role === 'admin') {
          setAdmin({
            id: session.user.id,
            email: session.user.email!,
            role: 'admin',
            full_name: session.user.user_metadata.full_name,
            created_at: session.user.created_at
          });
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error.message);
        showAuthError(handleAuthError(error));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = adminSupabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Admin token refreshed successfully');
        }

        if (session?.user && session.user.user_metadata.role === 'admin') {
          setAdmin({
            id: session.user.id,
            email: session.user.email!,
            role: 'admin',
            full_name: session.user.user_metadata.full_name,
            created_at: session.user.created_at
          });
        } else {
          setAdmin(null);
        }
      } catch (error: any) {
        console.error('Auth state change error:', error.message);
        showAuthError(handleAuthError(error));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      if (!fullName.trim()) {
        throw new Error('Full name is required');
      }

      const { data, error } = await adminSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin',
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in to the Admin Portal.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('Registration failed. Please try again.');
      }

      showAuthSuccess('Admin account created successfully! Please check your email to verify your account.');
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      showAuthError(error.message || 'Failed to create admin account');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }

      if (!password) {
        throw new Error('Password is required');
      }

      const { data, error } = await adminSupabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid admin credentials. Please try again.');
        }
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No admin data received. Please try again.');
      }
      
      if (data.user.user_metadata.role !== 'admin') {
        await adminSupabase.auth.signOut();
        throw new Error('Unauthorized: This portal is for administrators only. Please use the correct login page.');
      }

      showAuthSuccess('Successfully signed in to Admin Portal!');
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      showAuthError(error.message || 'Failed to sign in to Admin Portal');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await adminSupabase.auth.signOut();
      if (error) throw error;
      showAuthSuccess('Successfully signed out from Admin Portal!');
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      showAuthError(error.message || 'Failed to sign out from Admin Portal');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }

      const { error } = await adminSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      
      if (error) throw error;
      
      showAuthSuccess('Admin password reset instructions have been sent to your email.');
    } catch (error: any) {
      console.error('Password reset error:', error.message);
      showAuthError(error.message || 'Failed to send admin reset instructions');
      throw error;
    }
  };

  return <AdminAuthContext.Provider value={{
    admin,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}