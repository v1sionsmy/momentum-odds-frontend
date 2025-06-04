"use client";

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { useAuth } from '@/lib/auth/AuthContext';

type AuthMode = 'login' | 'guest';

export function AuthContainer() {
  const [mode, setMode] = useState<AuthMode>('guest');
  const { isAuthenticated, isLoading } = useAuth();

  // If already authenticated, don't show auth forms
  if (isAuthenticated) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0B0E11] flex items-center justify-center">
        <div className="text-[#00FF8B] text-xl">Loading...</div>
      </div>
    );
  }

  // If in guest mode, don't show any auth forms - let users view the site
  if (mode === 'guest') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-[#0B0E11] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <LoginForm onModeChange={(newMode) => {
          if (newMode === 'signup') {
            // Redirect signup attempts to login
            setMode('login');
          } else {
            setMode(newMode as AuthMode);
          }
        }} />
        
        <div className="mt-4 text-center text-sm text-[color:var(--mo-muted)]">
          <button
            onClick={() => setMode('guest')}
            className="text-[color:var(--mo-accent)] hover:underline"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
} 