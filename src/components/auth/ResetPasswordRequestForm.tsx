"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

type AuthMode = 'login' | 'signup' | 'reset-request' | 'reset-password';

interface ResetPasswordRequestFormProps {
  onModeChange: (mode: AuthMode) => void;
}

export function ResetPasswordRequestForm({ onModeChange }: ResetPasswordRequestFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestPasswordReset) {
      setError('Password reset functionality is not available');
      return;
    }

    setIsLoading(true);
    setError('');
    setRateLimited(false);

    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Too many reset requests')) {
        setRateLimited(true);
        setError('Too many reset requests. Please wait before trying again.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          <p className="text-gray-400 mb-6">
            If an account exists with {email}, you will receive a password reset link shortly.
            The link will expire in 30 minutes.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setEmail('');
            }}
            className="text-[color:var(--mo-accent)] hover:underline"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        
        {error && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            rateLimited 
              ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500'
              : 'bg-red-500/10 border border-red-500/20 text-red-500'
          }`}>
            {error}
            {rateLimited && (
              <div className="mt-2 text-xs">
                This helps protect your account from unauthorized access.
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF8B]"
              placeholder="Enter your email"
              required
              disabled={rateLimited}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || rateLimited}
            className={`w-full py-3 rounded-lg font-bold ${
              isLoading || rateLimited
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-[#00FF8B] text-black hover:bg-[#00FF8B]/90'
            }`}
          >
            {isLoading ? 'Sending...' : rateLimited ? 'Rate Limited' : 'Send Reset Link'}
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-[color:var(--mo-muted)]">
          Remember your password?{' '}
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-[color:var(--mo-accent)] hover:underline"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
} 