import { createClient } from '@supabase/supabase-js';
import type { AuthError } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create separate clients for admin and user authentication
export const adminSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'academic_writing_admin_auth',
    flowType: 'pkce'
  }
});

export const userSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'academic_writing_user_auth',
    flowType: 'pkce'
  }
});

// Initialize session from local storage with error handling
export const initializeAuth = async (isAdmin = false) => {
  try {
    const client = isAdmin ? adminSupabase : userSupabase;
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error) {
      console.error('Auth initialization error:', error);
      return null;
    }

    // If session exists but token is expired, try to refresh
    if (session && isTokenExpired(session.access_token)) {
      const { data: { session: refreshedSession }, error: refreshError } = 
        await client.auth.refreshSession();
      
      if (refreshError) {
        console.error('Token refresh error:', refreshError);
        return null;
      }
      
      return refreshedSession;
    }

    return session;
  } catch (error) {
    console.error('Unexpected error during auth initialization:', error);
    return null;
  }
};

// Utility function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // Assume expired if we can't parse the token
  }
};

// Utility function to handle auth errors
export const handleAuthError = (error: AuthError | null): string => {
  if (!error) return 'An unknown error occurred';
  
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please try again.';
    case 'Email not confirmed':
      return 'Please verify your email address before signing in.';
    case 'Email already registered':
      return 'This email is already registered. Please sign in instead.';
    case 'Invalid refresh token':
    case 'refresh_token_not_found':
      return 'Your session has expired. Please sign in again.';
    default:
      return error.message;
  }
};