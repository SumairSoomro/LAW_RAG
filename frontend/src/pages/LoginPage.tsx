import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signInWithGoogle, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    try {
      await signIn({ email, password, remember });
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the LoginForm component
      throw error;
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // User will be redirected to Google, then back to dashboard
    } catch (error) {
      // Error handling is done in the LoginForm component
      throw error;
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      onSignUpClick={handleSignUpClick}
      onGoogleSignIn={handleGoogleSignIn}
      isLoading={loading}
    />
  );
};