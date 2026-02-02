import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { User } from '@/types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      apiClient.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    setUser(response.user);
    router.push('/dashboard');
  }, [router]);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    const response = await apiClient.signup({ email, password, full_name: fullName });
    return { email: response.email };
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const response = await apiClient.verifyEmail(token);
    setUser(response.user);
    router.push('/dashboard');
  }, [router]);

  const resendVerification = useCallback(async (email: string) => {
    await apiClient.resendVerification(email);
  }, []);

  const logout = useCallback(async () => {
    await apiClient.logout();
    setUser(null);
    router.push('/');
  }, [router]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    verifyEmail,
    resendVerification,
    checkAuth,
  };
}
