import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { backendApi, clearAuthToken, getAuthToken, setAuthToken } from '../services/backendApi';
import { mapUserFromApi, syncBackendToStorage } from '../services/storageSync';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const defaultAuthValue: AuthContextType = {
  currentUser: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthValue);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const token = getAuthToken();

    if (!storedUser || !token) {
      if (!token) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      return;
    }

    const parsedUser = JSON.parse(storedUser) as User;
    setCurrentUser(parsedUser);

    backendApi
      .me()
      .then((response) => {
        const normalizedUser = mapUserFromApi(response?.user);
        setCurrentUser(normalizedUser);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(normalizedUser));
        return syncBackendToStorage({
          includeUsers: String(normalizedUser.role || '').toLowerCase() === 'admin',
        });
      })
      .catch(() => {
        clearAuthToken();
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        setCurrentUser(null);
      });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await backendApi.login(email, password);
      const token = String(response?.token || '');
      const user = mapUserFromApi(response?.user);

      if (!token || !user?.id) {
        return false;
      }

      setAuthToken(token);
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

      await syncBackendToStorage({
        includeUsers: String(user.role || '').toLowerCase() === 'admin',
      });

      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    clearAuthToken();
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
