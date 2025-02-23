import React, { createContext, useContext, useEffect, useState } from 'react';
import { userSupabase, handleAuthError } from '../lib/supabase';
import type { AuthUser } from '../types/auth';
import { showAuthError, showAuthSuccess } from '../components/feedback/AuthFeedback';
import { validateEmail, validatePassword } from '../utils/validation';

interface UserAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'client' | 'writer', fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await userSupabase.auth.getSession();
        if (error) throw error;

        if (session?.user && ['client', 'writer'].includes(session.user.user_metadata.role)) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata.role,
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

    const { data: { subscription } } = userSupabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }

        if (session?.user && ['client', 'writer'].includes(session.user.user_metadata.role)) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata.role,
            full_name: session.user.user_metadata.full_name,
            created_at: session.user.created_at
          });
        } else {
          setUser(null);
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

  const signUp = async (email: string, password: string, role: 'client' | 'writer', fullName: string) => {
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

      if (!['client', 'writer'].includes(role)) {
        throw new Error('Invalid user role');
      }

      const { data, error } = await userSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('Registration failed. Please try again.');
      }

      showAuthSuccess('Account created successfully! Please check your email to verify your account.');
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      showAuthError(handleAuthError(error));
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

      const { data, error } = await userSupabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user data received. Please try again.');
      }

      if (!['client', 'writer'].includes(data.user.user_metadata.role)) {
        await userSupabase.auth.signOut();
        throw new Error('Invalid user role. Please use the correct login page.');
      }

      showAuthSuccess('Successfully signed in!');
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      showAuthError(handleAuthError(error));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await userSupabase.auth.signOut();
      if (error) throw error;
      showAuthSuccess('Successfully signed out!');
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      showAuthError(handleAuthError(error));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }

      const { error } = await userSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      showAuthSuccess('Password reset instructions have been sent to your email.');
    } catch (error: any) {
      console.error('Password reset error:', error.message);
      showAuthError(handleAuthError(error));
      throw error;
    }
  };

  return <UserAuthContext.Provider value={{
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}