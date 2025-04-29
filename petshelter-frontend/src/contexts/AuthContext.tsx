import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { getToken, setToken, removeToken, isTokenValid, parseJwt } from '../utils/tokenUtils';

interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  activated: number;
  adminType?: string;
  staffType?: string;
  shelterId?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isShelterStaff: boolean;
  isAdopter: boolean;
  adminType?: string;
  staffType?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Add helper function to convert role
  const convertRole = (role: string | number) => {
    // If it's already a string role from JWT
    if (typeof role === 'string') {
      return role;
    }
    // If it's a numeric role from API
    switch (role) {
      case 0: return 'Admin';
      case 1: return 'Adopter';
      case 2: return 'ShelterStaff';
      default: return 'Unknown';
    }
  };

  // Update useEffect for JWT token parsing
  useEffect(() => {
    const initializeAuth = () => {
      if (!isTokenValid()) {
        removeToken();
        setUser(null);
        return;
      }

      const token = getToken();
      if (token) {
        const decoded = parseJwt(token);
        if (decoded) {
          const role = convertRole(decoded.role);
          setUser({
            id: decoded.id,
            email: decoded.email,
            role: role,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            activated: 1,
            adminType: role === 'Admin' ? 'full' : undefined,
            staffType: role === 'ShelterStaff' ? 'staff' : undefined,
          });
        }
      }
    };

    initializeAuth();
    const interval = setInterval(initializeAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { token, user: userData } = response.data;
      
      console.log('Auth Context - Raw login data:', {
        rawUserData: userData,
        rawRole: userData.role,
        rawRoleType: typeof userData.role
      });
      
      const role = convertRole(userData.role);
      const userWithRole = {
        ...userData,
        role: role,
        adminType: role === 'Admin' ? 'full' : undefined,
        staffType: role === 'ShelterStaff' ? 'staff' : undefined,
      };

      console.log('Auth Context - Processed user data:', {
        processedUser: userWithRole,
        processedRole: userWithRole.role,
        isAdmin: userWithRole.role === 'Admin',
        isShelterStaff: userWithRole.role === 'ShelterStaff'
      });
      
      setToken(token);
      setUser(userWithRole);
      return userWithRole;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    // No redirection here - let the component handle it
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isShelterStaff: user?.role === 'ShelterStaff',
    isAdopter: user?.role === 'Adopter',
    adminType: user?.adminType,
    staffType: user?.staffType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 