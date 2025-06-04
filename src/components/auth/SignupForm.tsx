"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

type AuthMode = 'login' | 'signup' | 'reset-request' | 'reset-password';

interface SignupFormProps {
  onModeChange: (mode: AuthMode) => void;
}

export function SignupForm({ onModeChange }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signup) {
      setError('Signup functionality is not available');
      return;
    }

    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup(email, password, name);
    } catch {
      setError('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF8B]"
              placeholder="Enter your name"
              required
            />
          </div>

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
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF8B]"
              placeholder="Create a password"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF8B]"
              placeholder="Confirm your password"
              required
              minLength={8}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold ${
              isLoading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-[#00FF8B] text-black hover:bg-[#00FF8B]/90'
            }`}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-[color:var(--mo-muted)]">
          Already have an account?{' '}
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