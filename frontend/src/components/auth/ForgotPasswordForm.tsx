import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBackToLogin: () => void;
  isLoading: boolean;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  onBackToLogin,
  isLoading,
}) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    // Validation
    const newErrors: { email?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(email);
      setSuccess(true);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to send reset email. Please try again.'
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#dad2bc] p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#252323] mb-2">Check Your Email</h1>
            <p className="text-[#70798c]">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#f5f1ed] border border-[#dad2bc] rounded-lg p-4">
              <p className="text-sm text-[#70798c]">
                <strong>Didn't receive the email?</strong>
              </p>
              <ul className="text-xs text-[#70798c] mt-2 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure the email address is correct</li>
                <li>• Wait a few minutes for delivery</li>
              </ul>
            </div>

            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 text-[#70798c] hover:text-[#252323] transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#dad2bc] p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#f5f1ed] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#252323]" />
          </div>
          <h1 className="text-2xl font-bold text-[#252323] mb-2">Reset Your Password</h1>
          <p className="text-[#70798c]">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
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
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Send Reset Link Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#252323] hover:bg-[#70798c] text-[#f5f1ed] py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending Reset Link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>

          {/* Back to Login */}
          <button
            type="button"
            onClick={onBackToLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-[#70798c] hover:text-[#252323] transition-colors py-2 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};