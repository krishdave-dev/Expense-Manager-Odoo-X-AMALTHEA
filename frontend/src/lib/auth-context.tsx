'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User, Company, AuthResponse, ApiError } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; needsPasswordChange?: boolean; error?: string }>;
  logout: () => void;
  signup: (name: string, email: string, password: string, country: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getAuthToken();
      if (token) {
        try {
          // Verify token is still valid by fetching user profile
          const userData = await apiClient.getUserProfile();
          setUser(userData);
          setCompany(userData.company);
        } catch (error) {
          // Token is invalid or expired
          apiClient.removeAuthToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await apiClient.login({ email, password });
      
      // Store token
      apiClient.setAuthToken(response.access_token);
      
      // Update state
      setUser(response.user);
      setCompany(response.company);
      
      // Check if user needs to change password
      const needsPasswordChange = response.user.isTempPassword;
      
      return { 
        success: true, 
        needsPasswordChange,
        user: response.user
      };
    } catch (error) {
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth state
    apiClient.removeAuthToken();
    setUser(null);
    setCompany(null);
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear localStorage except for essential items
      const keysToKeep = ['theme', 'language']; // Add any keys you want to keep
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const signup = async (name: string, email: string, password: string, country: string) => {
    try {
      setIsLoading(true);
      await apiClient.signup({ name, email, password, country });
      
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.message || 'Signup failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await apiClient.changePassword({ currentPassword, newPassword });
      
      // Refresh user data to update isTempPassword flag
      await refreshUserData();
      
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.message || 'Password change failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await apiClient.getUserProfile();
      setUser(userData);
      setCompany(userData.company);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    company,
    isLoading,
    isAuthenticated,
    login,
    logout,
    signup,
    changePassword,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};