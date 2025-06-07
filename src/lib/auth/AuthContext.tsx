"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://momentum-ignition-backend.onrender.com';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  subscription_tier: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  resetPassword?: (token: string, newPassword: string) => Promise<void>;
  validateResetToken?: (token: string) => Promise<boolean>;
  requestPasswordReset?: (email: string) => Promise<void>;
  signup?: (username: string, email: string, password: string) => Promise<User>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed property for authentication status
  const isAuthenticated = user !== null;

  // Helper function to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  };

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      // Get token
      const tokenResponse = await fetch(`${API_BASE_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
        credentials: 'include',
        mode: 'cors',
      });

      if (!tokenResponse.ok) {
        throw new Error('Login failed');
      }

      const { access_token } = await tokenResponse.json();
      localStorage.setItem('token', access_token);

      // Fetch user data
      const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: getAuthHeader(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth function
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      // Verify token with backend
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: getAuthHeader(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 