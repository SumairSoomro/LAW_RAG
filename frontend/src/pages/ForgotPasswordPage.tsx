import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { useAuth } from '../hooks/useAuth';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, resetPassword, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleForgotPassword = async (email: string) => {
    try {
      await resetPassword(email);
      // Success is handled by the form component
    } catch (error) {
      // Error is handled by the form component
      throw error;
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <ForgotPasswordForm
      onSubmit={handleForgotPassword}
      onBackToLogin={handleBackToLogin}
      isLoading={loading}
    />
  );
};