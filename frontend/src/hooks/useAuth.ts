import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { LoginCredentials, SignupCredentials, AuthContextType } from '../types/auth';
import { supabase } from '../lib/supabase';

// Auth Context
export const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook for auth logic
export const useAuthLogic = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async ({ email, password }: LoginCredentials) => {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      setLoading(false);
      throw new Error('Login failed');
    }

    setLoading(false);
    return { user: data.user, session: data.session };
  };

  const signUp = async ({ username, email, password }: SignupCredentials) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username, // Store username in auth metadata for now
        },
        // Note: Email confirmation is controlled in Supabase Dashboard
        // Go to Authentication > Settings > "Enable email confirmations" to disable
      },
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    if (!data.user) {
      setLoading(false);
      throw new Error('Signup failed');
    }

    setLoading(false);
    return { user: data.user, session: data.session };
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    
    const { error } = await supabase.auth.signOut();
    
    // Don't throw error if session is missing - user is already logged out
    if (error && error.message !== 'Auth session missing!') {
      setLoading(false);
      throw new Error(error.message);
    }
    
    setUser(null);
    setLoading(false);
  };
  //did not end up implementing signInWithGoogle
  const signInWithGoogle = async () => {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    // Note: User will be redirected to Google, so we don't set loading to false here
    return data;
  };

  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
  };
};