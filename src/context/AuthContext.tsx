import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, removeStoredToken, getStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: string; phone?: string; location?: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const profile = await api.getMe();
          if (profile) {
            setUser(profile);
          } else {
            // Default to demo farmer if token was invalid
            await login('farmer@agritech.org', 'farmer123');
          }
        } else {
          // Auto-login default demo farmer for effortless instant access
          await login('farmer@agritech.org', 'farmer123');
        }
      } catch (err) {
        console.error('Failed to authenticate initial session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; role: string; phone?: string; location?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    setToken(null);
  };

  const switchDemoRole = async (role: UserRole) => {
    if (role === 'farmer') {
      await login('farmer@agritech.org', 'farmer123');
    } else if (role === 'expert') {
      await login('expert@agritech.org', 'expert123');
    } else if (role === 'admin') {
      await login('admin@agritech.org', 'admin123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
