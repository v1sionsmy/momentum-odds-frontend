"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'signup' | 'reset-request' | 'reset-password';

interface LoginFormProps {
  onModeChange: (mode: AuthMode) => void;
}

export function LoginForm({ onModeChange }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF8B]"
              placeholder="Enter your username or email"
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
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="button"
            onClick={() => onModeChange('reset-request')}
            className="text-sm text-[color:var(--mo-accent)] hover:underline w-full text-left"
          >
            Forgot your password?
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold ${
              isLoading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-[#00FF8B] text-black hover:bg-[#00FF8B]/90'
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-[color:var(--mo-muted)]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className="text-[color:var(--mo-accent)] hover:underline"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
} 