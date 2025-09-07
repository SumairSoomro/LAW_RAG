import { User as SupabaseUser } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  terms: boolean;
  marketing?: boolean;
}

export interface AuthError {
  message: string;
  code?: string;
  details?: string;
}

// Auth context types
export interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<any>;
  signUp: (credentials: SignupCredentials) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
}