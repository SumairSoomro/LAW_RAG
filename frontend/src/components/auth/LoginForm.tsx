import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, Scale } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string, remember: boolean) => Promise<void>;
  onSignUpClick: () => void;
  onGoogleSignIn: () => Promise<void>;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSignUpClick,
  onGoogleSignIn,
  isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!/\S+@\S+\.\S+/.test(email) && email) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(email, password, remember);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed. Please try again.'
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    try {
      await onGoogleSignIn();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Google sign-in failed. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#252323] rounded-xl flex items-center justify-center">
              <Scale className="w-7 h-7 text-[#f5f1ed]" />
            </div>
            <span className="text-2xl font-bold text-[#252323]">Legal Probe</span>
          </div>
          <h1 className="text-xl font-semibold text-[#252323] mb-2">Welcome back</h1>
          <p className="text-[#70798c]">Sign in to your account to continue analyzing legal documents</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg border border-[#dad2bc] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#252323] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-[#70798c]" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-[#f5f1ed] border pl-10 pr-4 py-3 rounded-lg text-[#252323] placeholder-[#70798c] focus:outline-none focus:bg-white focus:shadow-lg transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[#dad2bc] focus:border-[#70798c]'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#252323] mb-2">
                Password
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
                  placeholder="Enter your password"
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-[#dad2bc] text-[#252323] focus:ring-[#70798c] focus:ring-2"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-[#70798c]">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-[#70798c] hover:text-[#252323] transition-colors"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#252323] hover:bg-[#70798c] text-[#f5f1ed] py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#70798c] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#dad2bc]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#a99985]">or</span>
              </div>
            </div>

            {/* Social Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-[#dad2bc] text-[#252323] py-3 px-4 rounded-lg font-medium hover:bg-[#f5f1ed] transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-[#70798c]">
            Don't have an account?{' '}
            <button
              onClick={onSignUpClick}
              className="text-[#252323] font-medium hover:text-[#70798c] transition-colors"
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-[#a99985]">
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#70798c] hover:text-[#252323] transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#70798c] hover:text-[#252323] transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};