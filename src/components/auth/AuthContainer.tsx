"use client";

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ResetPasswordRequestForm } from './ResetPasswordRequestForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { useAuth } from '@/lib/auth/AuthContext';
import { useSearchParams } from 'next/navigation';

type AuthMode = 'login' | 'signup' | 'reset-request' | 'reset-password';

export function AuthContainer() {
  const [mode, setMode] = useState<AuthMode>('login');
  const { isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');

  // If there's a reset token in the URL, show the reset password form
  React.useEffect(() => {
    if (resetToken) {
      setMode('reset-password');
    }
  }, [resetToken]);

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

  const renderAuthForm = () => {
    switch (mode) {
      case 'login':
        return <LoginForm onModeChange={setMode} />;
      case 'signup':
        return <SignupForm onModeChange={setMode} />;
      case 'reset-request':
        return <ResetPasswordRequestForm onModeChange={setMode} />;
      case 'reset-password':
        return <ResetPasswordForm onModeChange={setMode} />;
      default:
        return <LoginForm onModeChange={setMode} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0E11] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        {renderAuthForm()}
        
        <div className="mt-4 text-center text-sm text-[color:var(--mo-muted)]">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-[color:var(--mo-accent)] hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-[color:var(--mo-accent)] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 