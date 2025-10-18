'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, passcode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sendVerification: (email: string, type: 'register' | 'reset-password') => Promise<void>;
  resetPassword: (email: string, passcode: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      await api.post('/auth/login', { email, password });
      await refreshUser();
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, passcode: string) => {
    try {
      await api.post('/auth/register', {
        email,
        password,
        passcode,
      });
    } catch (error) {
      throw error;
    }
  };

  const sendVerification = async (email: string, type: 'register' | 'reset-password') => {
    try {
      await api.post('/auth/send-verification', { email, type });
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string, passcode: string, password: string) => {
    try {
      await api.post('/auth/reset-password', { email, passcode, password });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      setUser(null);
      router.push('/');
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.get('/auth/user');
      setUser(userData);
    } catch (error) {
      // Oturumu olmayan ziyaretçi - normal durum
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sayfa yüklendiğinde kullanıcı bilgisini kontrol et
    refreshUser();
  }, [refreshUser]);

  // Sayfa odaklandığında kullanıcı durumunu kontrol et
  useEffect(() => {
    const handleFocus = () => {
      if (!isLoading) {
        refreshUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshUser, isLoading]);

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    sendVerification,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}