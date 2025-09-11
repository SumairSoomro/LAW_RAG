import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface PasswordStrength {
  score: number;
  text: string;
  color: string;
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, text: 'Very weak', color: 'bg-red-500' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  // Get token from URL params - Supabase uses different formats
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const token = searchParams.get('token');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  useEffect(() => {
    const validateToken = async () => {
      // Check if we're coming from email (fragment-based approach)
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.slice(1)); // Remove '#' and parse
        const hashAccessToken = params.get('access_token');
        const hashRefreshToken = params.get('refresh_token');
        const hashType = params.get('type');

        if (hashAccessToken && hashRefreshToken && hashType === 'recovery') {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken,
            });

            if (!error) {
              setValidToken(true);
              return;
            }
          } catch (error) {
            console.error('Password reset session error');
            setValidToken(false);
            return;
          }
        }
      }

      // Check query parameters (PKCE flow)
      if (type !== 'recovery' && type !== 'password_recovery') {
        setValidToken(false);
        return;
      }

      try {

        // Method: Try with token_hash (newer Supabase format)
        if (tokenHash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          });

          if (!error && data.user) {
            setValidToken(true);
            return;
          }
        }


        // If all methods fail
        setValidToken(false);

      } catch (error) {
        console.error('Password reset validation failed');
        setValidToken(false);
      }
    };

    validateToken();
  }, [accessToken, refreshToken, token, tokenHash, type]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthLevels = [
      { text: 'Very weak', color: 'bg-red-500' },
      { text: 'Weak', color: 'bg-orange-500' },
      { text: 'Fair', color: 'bg-yellow-500' },
      { text: 'Good', color: 'bg-blue-500' },
      { text: 'Strong', color: 'bg-green-500' }
    ];

    return { score, ...strengthLevels[score] };
  };

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validation
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password updated successfully! Please sign in with your new password.' }
        });
      }, 3000);

    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to update password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading state while validating token
  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#dad2bc] p-8 text-center">
          <div className="w-8 h-8 border-2 border-[#252323] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#70798c]">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Show error state for invalid token
  if (validToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#dad2bc] p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#252323] mb-4">Invalid Reset Link</h1>
          <p className="text-[#70798c] mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-[#252323] hover:bg-[#70798c] text-[#f5f1ed] py-3 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#dad2bc] p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#252323] mb-4">Password Updated!</h1>
          <p className="text-[#70798c] mb-6">
            Your password has been successfully updated. You'll be redirected to the login page shortly.
          </p>
          <div className="w-8 h-8 border-2 border-[#252323] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#dad2bc] p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#f5f1ed] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#252323]" />
          </div>
          <h1 className="text-2xl font-bold text-[#252323] mb-2">Create New Password</h1>
          <p className="text-[#70798c]">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* New Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#252323] mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-[#70798c]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-[#f5f1ed] border pl-10 pr-12 py-3 rounded-lg text-[#252323] placeholder-[#70798c] focus:outline-none focus:bg-white focus:shadow-lg transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#dad2bc] focus:border-[#70798c]'
                }`}
                placeholder="Create a strong password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#70798c] hover:text-[#252323] transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex space-x-1 mb-1">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full ${
                        index <= passwordStrength.score ? passwordStrength.color : 'bg-[#dad2bc]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#a99985]">Password strength: {passwordStrength.text}</p>
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#252323] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-[#70798c]" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-[#f5f1ed] border pl-10 pr-10 py-3 rounded-lg text-[#252323] placeholder-[#70798c] focus:outline-none focus:bg-white focus:shadow-lg transition-all duration-200 ${
                  errors.confirmPassword 
                    ? 'border-red-500 focus:border-red-500' 
                    : confirmPassword && password === confirmPassword
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-[#dad2bc] focus:border-[#70798c]'
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {confirmPassword && password === confirmPassword && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Update Password Button */}
          <button
            type="submit"
            disabled={isLoading || loading}
            className="w-full bg-[#252323] hover:bg-[#70798c] text-[#f5f1ed] py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating Password...
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};