"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearTokens, fetchWithAuth, setTokens } from '@/lib/auth';

interface User {
  id: number;
  email: string;
  name: string;
  role: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (access: string, refresh: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => { },
  logout: () => { },
  checkAuth: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (access: string, refresh: string, userData: User) => {
    setTokens(access, refresh);
    setUser(userData);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/users/me/');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check auth on load
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }

    const unauthListener = () => logout();
    window.addEventListener('auth_unauthorized', unauthListener);
    return () => window.removeEventListener('auth_unauthorized', unauthListener);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
