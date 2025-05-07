import axios from 'axios';
import { getToken, removeToken, parseJwt } from '../utils/tokenUtils';

const baseURL = 'http://localhost:5291';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      const decoded = parseJwt(token);
      console.log('API Request - Token Info:', {
        url: config.url,
        method: config.method,
        token: token,
        decodedToken: decoded,
        adminType: decoded?.AdminType,
        adminTypeType: typeof decoded?.AdminType
      });
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      // Don't redirect here, let the component handle it
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/AuthApi/Login', credentials);
    return response.data;
  },
  register: async (data: RegisterData) => {
    const response = await api.post('/AuthApi/Register', data);
    return response.data;
  },
  logout: () => {
    removeToken();
  },
};

// Animals API
export const animalsApi = {
  getAll: (searchParams?: { name?: string }) =>
    api.get('/Adoption/List-Pets', { params: searchParams }),
  getById: (id: string) => api.get(`/Adoption/View-Pet/${id}`),
  adopt: (data: { 
    adopterId_FK: number;
    petId_FK: number;
    shelter_FK: number;
  }) => api.post('/Adoption/Adopt', data),
  cancelAdoption: (id: number) => api.post(`/Adoption/Cancel-Adoption/${id}`),
  getAdoptionHistory: () => api.get('/Adoption/Adoption-History'),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get('/Admin/dashboard-stats').then(res => res.data),
  getShelters: async () => {
    const response = await api.get('/Admin/Show-Shelters');
    return response.data;
  },
  addShelter: async (data: {
    ShelterName: string;
    Location: string;
    Phone: string;
    Description: string;
  }): Promise<Shelter> => {
    try {
      console.log('API - Adding shelter with data:', data);
      const response = await api.post('/Admin/Add-Shelter', data);
      console.log('API - Add shelter response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API - Error adding shelter:', error);
      if (error.response) {
        console.error('API - Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      if (error.response?.status === 401) {
        throw new Error('Unauthorized: You do not have permission to add shelters');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Failed to add shelter');
      }
      throw new Error('Failed to add shelter. Please try again.');
    }
  },
  updateShelter: (id: number, data: any) => api.put(`/Admin/Edit-Shelter/${id}`, data),
  deleteShelter: async (shelterId: number) => {
    const response = await api.delete('/Admin/Delete-Shelter', {
      data: { 
        ShelterID: shelterId,
        ShelterName: "Temp Name",
        Location: "Temp Location",
        Phone: "1234567890",
        Description: "Temporary description for deletion"
      }
    });
    return response.data;
  },
  
  getUsers: () => api.get('/Admin/List-Users').then(res => res.data),
  getUserDetails: (id: number, role: number) => api.get(`/Admin/User-Details/${id}?role=${role}`).then(res => res.data),
  addUser: (data: any) => api.post('/Admin/Add-User', data),
  addAdmin: (data: any) => api.post('/Admin/Add-Admin-Account', data),
  updateUser: (data: any) => api.put('/Admin/EditUserDetails', data),
  deleteUser: (data: any) => api.delete('/Admin/Delete-User', { data }),
  banUser: (data: { id: number; role: number; uname: string; email: string; adminType?: number; staffType?: number; phone?: string; address?: string }) => {
    const baseDto = {
      id: data.id,
      role: data.role,
      uname: data.uname,
      email: data.email,
      activated: 0,
      banned: true
    };

    // Add role-specific fields
    switch (data.role) {
      case 0: // Admin
        return api.put('/Admin/Ban-Account', {
          ...baseDto,
          adminType: data.adminType
        });
      case 1: // Adopter
        return api.put('/Admin/Ban-Account', {
          ...baseDto,
          phone: data.phone,
          address: data.address
        });
      case 2: // Staff
        return api.put('/Admin/Ban-Account', {
          ...baseDto,
          staffType: data.staffType,
          phone: data.phone
        });
      default:
        return api.put('/Admin/Ban-Account', baseDto);
    }
  },
  unbanUser: (data: { id: number; role: number; uname: string; email: string; adminType?: number; staffType?: number; phone?: string; address?: string }) => {
    const baseDto = {
      id: data.id,
      role: data.role,
      uname: data.uname,
      email: data.email,
      activated: 1,
      banned: false
    };

    // Add role-specific fields
    switch (data.role) {
      case 0: // Admin
        return api.put('/Admin/Ban-Account', {
          ...baseDto,
          adminType: data.adminType
        });
      case 1: // Adopter
        return api.put('/Admin/Ban-Account', {
          ...baseDto,
          phone: data.phone,
          address: data.address
        });
      case 2: // Staff
        return api.put('/Admin/Ban-Account', {
          ...baseDto,
          staffType: data.staffType,
          phone: data.phone
        });
      default:
        return api.put('/Admin/Ban-Account', baseDto);
    }
  },
  activateUser: (data: { id: number; role: number; uname: string; email: string; adminType?: number; staffType?: number; phone?: string; address?: string }) => {
    const baseDto = {
      id: data.id,
      role: data.role,
      uname: data.uname,
      email: data.email,
      activated: 1,
      banned: false
    };

    // Add role-specific fields
    switch (data.role) {
      case 0: // Admin
        return api.put('/Admin/Activate-Deactivate-Account', {
          ...baseDto,
          adminType: data.adminType
        });
      case 1: // Adopter
        return api.put('/Admin/Activate-Deactivate-Account', {
          ...baseDto,
          phone: data.phone,
          address: data.address
        });
      case 2: // Staff
        return api.put('/Admin/Activate-Deactivate-Account', {
          ...baseDto,
          staffType: data.staffType,
          phone: data.phone
        });
      default:
        return api.put('/Admin/Activate-Deactivate-Account', baseDto);
    }
  },
  deactivateUser: (data: { id: number; role: number; uname: string; email: string; adminType?: number; staffType?: number; phone?: string; address?: string }) => {
    const baseDto = {
      id: data.id,
      role: data.role,
      uname: data.uname,
      email: data.email,
      activated: 0,
      banned: false
    };

    // Add role-specific fields
    switch (data.role) {
      case 0: // Admin
        return api.put('/Admin/Activate-Deactivate-Account', {
          ...baseDto,
          adminType: data.adminType
        });
      case 1: // Adopter
        return api.put('/Admin/Activate-Deactivate-Account', {
          ...baseDto,
          phone: data.phone,
          address: data.address
        });
      case 2: // Staff
        return api.put('/Admin/Activate-Deactivate-Account', {
          ...baseDto,
          staffType: data.staffType,
          phone: data.phone
        });
      default:
        return api.put('/Admin/Activate-Deactivate-Account', baseDto);
    }
  },
  getShelterDetails: async (id: number) => {
    try {
      console.log('API - Fetching shelter details for ID:', id);
      const response = await api.get(`/Admin/Show-Shelters-details/${id}`);
      console.log('API - Shelter details response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API - Error fetching shelter details:', error);
      if (error.response) {
        console.error('API - Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  },
};

export interface RegisterData {
  uname: string;
  email: string;
  password: string;
  role: number;
  phone?: string;
  address?: string;
  staffType?: number;
}

export interface Shelter {
  shelterId: number;
  shelterName: string;
  shelterLocation: string;
  shelterPhone: string;
  description: string | null;
  countStaff: number;
  categories: any[] | null;
  staff: any[] | null;
}

export interface AddShelterData {
  shelterName: string;
  shelterLocation: string;
  shelterPhone: string;
  description: string;
}

export type { }; 