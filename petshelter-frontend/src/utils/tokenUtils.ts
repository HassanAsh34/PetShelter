interface DecodedToken {
  nameid: string;  // JWT claim for user ID
  id?: number;     // Keep for backward compatibility
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  exp: number;
  AdminType?: string | number;
  staffType?: string;
}

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = parseJwt(token);
    if (!decoded) return false;
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

export const parseJwt = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    
    // Convert AdminType to number if it exists
    if (decoded.AdminType !== undefined) {
      const adminTypeValue = typeof decoded.AdminType === 'string' 
        ? parseInt(decoded.AdminType, 10)
        : Number(decoded.AdminType);
      
      if (!isNaN(adminTypeValue)) {
        decoded.AdminType = adminTypeValue;
      }
    }
    
    console.log('Token Utils - Parsed JWT:', {
      decoded,
      adminType: decoded.AdminType,
      adminTypeType: typeof decoded.AdminType,
      rawAdminType: decoded.AdminType
    });
    
    return decoded;
  } catch (error) {
    console.error('Token Utils - Error parsing JWT:', error);
    return null;
  }
}; 