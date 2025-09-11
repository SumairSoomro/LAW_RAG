import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Scale, UserPlus, AtSign, Check } from 'lucide-react';

interface SignupFormProps {
  onSubmit: (username: string, email: string, password: string) => Promise<void>;
  onLoginClick: () => void;
  isLoading?: boolean;
}

interface PasswordStrength {
  score: number;
  text: string;
  color: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  onLoginClick,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, text: 'Very weak', color: 'bg-red-500' });

  const validateUsername = (username: string): boolean => {
    const pattern = /^[a-zA-Z0-9_]{3,20}$/;
    return pattern.test(username);
  };

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strength = Math.min(score, 4);
    const texts = ['Very weak', 'Weak', 'Good', 'Strong', 'Very strong'];
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      score: strength,
      text: texts[strength],
      color: colors[Math.min(strength - 1, 3)] || 'bg-gray-300'
    };
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update password strength
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters, letters, numbers, and underscores only';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    try {
      await onSubmit(
        formData.username,
        formData.email,
        formData.password
      );
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Signup failed. Please try again.'
      });
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <h1 className="text-xl font-semibold text-[#252323] mb-2">Create your account</h1>
          <p className="text-[#70798c]">Start analyzing legal documents with AI-powered insights</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-xl shadow-lg border border-[#dad2bc] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#252323] mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="w-5 h-5 text-[#70798c]" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full bg-[#f5f1ed] border pl-10 pr-12 py-3 rounded-lg text-[#252323] placeholder-[#70798c] focus:outline-none focus:bg-white focus:shadow-lg transition-all duration-200 ${
                    errors.username 
                      ? 'border-red-500 focus:border-red-500' 
                      : validateUsername(formData.username) && formData.username
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-[#dad2bc] focus:border-[#70798c]'
                  }`}
                  placeholder="Choose a username"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {validateUsername(formData.username) && formData.username && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              {errors.username ? (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              ) : (
                <p className="mt-1 text-xs text-[#a99985]">3-20 characters, letters, numbers, and underscores only</p>
              )}
            </div>

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
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`h-1 w-1/4 rounded-full transition-colors ${
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
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full bg-[#f5f1ed] border pl-10 pr-12 py-3 rounded-lg text-[#252323] placeholder-[#70798c] focus:outline-none focus:bg-white focus:shadow-lg transition-all duration-200 ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-[#dad2bc] focus:border-[#70798c]'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>


            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#252323] hover:bg-[#70798c] text-[#f5f1ed] py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#70798c] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </span>
            </button>

          </form>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-[#70798c]">
            Already have an account?{' '}
            <button
              onClick={onLoginClick}
              className="text-[#252323] font-medium hover:text-[#70798c] transition-colors"
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};