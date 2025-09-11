import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuth } from '../hooks/useAuth';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signUp, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignup = async (
    username: string, 
    email: string, 
    password: string
  ) => {
    try {
      await signUp({ username, email, password, terms: true, marketing: false });
      // Redirect to dashboard after successful signup
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the SignupForm component
      throw error;
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };


  return (
    <SignupForm
      onSubmit={handleSignup}
      onLoginClick={handleLoginClick}
      isLoading={loading}
    />
  );
};