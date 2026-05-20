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
  isLoading: boolean;
}

const defaultAuthValue: AuthContextType = {
  currentUser: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const token = getAuthToken();
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (!token || !storedUser) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;
      return parsedUser?.id ? parsedUser : null;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const token = getAuthToken();

    if (!storedUser || !token) {
      if (!token) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    let parsedUser: User | null = null;
    try {
      parsedUser = JSON.parse(storedUser) as User;
    } catch {
      clearAuthToken();
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    if (!parsedUser?.id) {
      clearAuthToken();
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

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
      })
      .finally(() => {
        setIsLoading(false);
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
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
