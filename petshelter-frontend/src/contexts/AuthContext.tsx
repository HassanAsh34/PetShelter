import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { getToken, setToken, removeToken, isTokenValid, parseJwt } from '../utils/tokenUtils';
import { useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  uname: string;
  email: string;
  role: string;
  activated: number;
  banned: boolean;
  adminType?: number;
  staffType?: string;
  phone?: string;
  address?: string;
  hiredDate?: string;
  shelter?: {
    shelterId: number;
    shelterName: string;
    shelterLocation: string;
    shelterPhone: string;
  };
}

interface DecodedToken {
  id: number;
  uname: string;
  email: string;
  role: string;
  activated: number;
  banned: boolean;
  AdminType?: number;
  StaffType?: string;
  phone?: string;
  address?: string;
  hiredDate?: string;
  shelter?: {
    shelterId: number;
    shelterName: string;
    shelterLocation: string;
    shelterPhone: string;
  };
  exp: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isShelterStaff: boolean;
  isAdopter: boolean;
  adminType: number | undefined;
  staffType: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isShelterStaff, setIsShelterStaff] = useState(false);
  const [isAdopter, setIsAdopter] = useState(false);
  const [adminType, setAdminType] = useState<number | undefined>(undefined);
  const [staffType, setStaffType] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

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
        setIsAdmin(false);
        setIsShelterStaff(false);
        setIsAdopter(false);
        setAdminType(undefined);
        setStaffType(undefined);
        return;
      }

      const token = getToken();
      if (token) {
        parseToken(token);
      }
    };

    initializeAuth();
    const interval = setInterval(initializeAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  const parseToken = (token: string) => {
    try {
      const raw = parseJwt(token);
      if (!raw) throw new Error('Invalid token');
      const decodedToken = raw as unknown as DecodedToken;
      const userData: User = {
        id: decodedToken.id || 0,
        uname: decodedToken.uname || '',
        email: decodedToken.email || '',
        role: decodedToken.role || '',
        activated: decodedToken.activated || 0,
        banned: decodedToken.banned || false,
        adminType: decodedToken.AdminType,
        staffType: decodedToken.StaffType,
        phone: decodedToken.phone,
        address: decodedToken.address,
        hiredDate: decodedToken.hiredDate,
        shelter: decodedToken.shelter
      };
      setUser(userData);
      setIsAdmin(decodedToken.role === 'Admin');
      setIsShelterStaff(decodedToken.role === 'ShelterStaff');
      setIsAdopter(decodedToken.role === 'Adopter');
      setAdminType(decodedToken.AdminType);
      setStaffType(decodedToken.StaffType);
    } catch (error) {
      console.error('Error parsing token:', error);
      setUser(null);
      setIsAdmin(false);
      setIsShelterStaff(false);
      setIsAdopter(false);
      setAdminType(undefined);
      setStaffType(undefined);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authApi.login({ email, password });
      const { token, user: userData } = response;
      
      console.log('Auth Context - Raw login data:', {
        rawUserData: userData,
        rawRole: userData.role,
        rawRoleType: typeof userData.role,
        rawAdminType: userData.adminType,
        rawAdminTypeType: typeof userData.adminType,
        token: token
      });
      
      const role = convertRole(userData.role);
      // Fix adminType conversion in login
      let adminTypeValue: number | undefined;
      if (userData.adminType !== undefined) {
        if (typeof userData.adminType === 'string') {
          const parsedValue = parseInt(userData.adminType, 10);
          adminTypeValue = isNaN(parsedValue) ? undefined : parsedValue;
        } else if (typeof userData.adminType === 'number') {
          adminTypeValue = userData.adminType;
        }
      }

      // If we're an admin but don't have an adminType, set it to 0 (SuperAdmin)
      if (role === 'Admin' && adminTypeValue === undefined) {
        adminTypeValue = 0;
        console.log('Setting default adminType to 0 for Admin role');
      }

      const userWithRole: User = {
        ...userData,
        role: role,
        adminType: adminTypeValue,
        staffType: userData.staffType || (role === 'ShelterStaff' ? 'staff' : undefined),
      };

      console.log('Auth Context - Processed user data:', {
        processedUser: userWithRole,
        processedRole: userWithRole.role,
        isAdmin: userWithRole.role === 'Admin',
        isShelterStaff: userWithRole.role === 'ShelterStaff',
        adminType: userWithRole.adminType,
        adminTypeType: typeof userWithRole.adminType,
        isSuperAdmin: userWithRole.adminType === 0
      });

      // Parse and log the JWT token
      const decodedToken = parseJwt(token);
      console.log('Auth Context - Decoded JWT token:', {
        decodedToken,
        adminTypeFromToken: decodedToken?.AdminType,
        adminTypeFromTokenType: typeof decodedToken?.AdminType,
        isSuperAdmin: decodedToken?.AdminType === '0'
      });
      
      setToken(token);
      setUser(userWithRole);
      setIsAdmin(userWithRole.role === 'Admin');
      setIsShelterStaff(userWithRole.role === 'ShelterStaff');
      setIsAdopter(userWithRole.role === 'Adopter');
      setAdminType(userWithRole.adminType);
      setStaffType(userWithRole.staffType);
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAdmin(false);
    setIsShelterStaff(false);
    setIsAdopter(false);
    setAdminType(undefined);
    setStaffType(undefined);
    queryClient.clear();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: isAdmin,
    isShelterStaff: isShelterStaff,
    isAdopter: isAdopter,
    adminType: adminType,
    staffType: staffType,
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

export default AuthProvider; 