import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, loading } = useAuth();

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