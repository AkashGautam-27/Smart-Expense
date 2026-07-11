import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import api from '../utils/api';

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (name: string, avatar: string, mobile: string) => Promise<void>;
  verifyEmailOtp: (otp: string) => Promise<void>;
  resendEmailOtp: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// authFetch helper has been removed and replaced by custom Axios client `api` directly.

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('smartspend_token'),
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('smartspend_token');
      if (!storedToken) {
        setAuthState({ user: null, token: null, isLoading: false });
        return;
      }

      try {
        const response = await api.get('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        setAuthState({
          user: response.data.user,
          token: storedToken,
          isLoading: false,
        });
      } catch (err: any) {
        console.error('Failed to verify token:', err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('smartspend_token');
          setAuthState({ user: null, token: null, isLoading: false });
        } else {
          setAuthState({ user: null, token: storedToken, isLoading: false });
        }
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const data = response.data;

      localStorage.setItem('smartspend_token', data.token);
      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Server error during login.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      const data = response.data;

      localStorage.setItem('smartspend_token', data.token);
      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Server error during registration.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProfile = async (name: string, avatar: string, mobile: string) => {
    setError(null);
    try {
      const response = await api.put('/api/auth/profile', { name, avatar, mobile });
      const data = response.data;

      setAuthState(prev => ({
        ...prev,
        user: data.user,
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update profile.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyEmailOtp = async (otp: string) => {
    setError(null);
    try {
      await api.post('/api/auth/verify-otp', {
        email: authState.user?.email,
        otp,
      }, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      setAuthState(prev => {
        if (!prev.user) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            isVerified: true
          }
        };
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Verification failed.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resendEmailOtp = async () => {
    setError(null);
    try {
      await api.post('/api/auth/resend-otp', { email: authState.user?.email });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to resend OTP.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn('Logging out server session failed, clearing locally', e);
    }
    localStorage.removeItem('smartspend_token');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, updateProfile, verifyEmailOtp, resendEmailOtp, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be activated inside an AuthProvider');
  }
  return context;
}
