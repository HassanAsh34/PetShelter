import axios from 'axios';
import { getToken, removeToken, parseJwt } from '../utils/tokenUtils';

// Define UserDto interface
interface UserDto {
  id: number;
  uname: string;
  email: string;
  role: number;
  activated: number;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  bannedAt?: string;
  adminType?: number;
  staffType?: number;
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
  updateUserDetails: async (userData: UserDto): Promise<UserDto> => {
    const response = await api.put('/UpdateProfile', userData);
    return response.data;
  },
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await api.get('/View-Profile');
    return response.data;
  }
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
    try {
      const response = await api.delete(`/Admin/Delete-Shelter/${shelterId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting shelter:', error);
      throw error;
    }
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
  getCategories: async (shelterId?: number) => {
    try {
      const response = await api.get(`/Admin/Show-Categories${shelterId ? `?shelterId=${shelterId}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  addCategory: async (data: { CategoryName: string; CategoryDescription: string; Shelter_FK: number }) => {
    try {
      const requestData = {
        categoryName: data.CategoryName,
        categoryDescription: data.CategoryDescription,
        shelter_FK: data.Shelter_FK
      };
      console.log('API - Adding category with data:', requestData);
      const response = await api.post('/Admin/Add-Category', requestData);
      console.log('API - Add category response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error adding category:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to add category');
      }
      throw error;
    }
  },
  updateCategory: async (data: { CategoryId: number; CategoryName: string; CategoryDescription: string; Shelter_FK: number }) => {
    try {
      const requestData = {
        categoryId: data.CategoryId,
        categoryName: data.CategoryName,
        categoryDescription: data.CategoryDescription,
        shelter_FK: data.Shelter_FK
      };
      console.log('API - Updating category with data:', requestData);
      const response = await api.put('/Admin/Edit-Category', requestData);
      console.log('API - Update category response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to update category');
      }
      throw error;
    }
  },
  deleteCategory: async (data: { CategoryId: number; CategoryName: string; CategoryDescription: string; Shelter_FK: number }) => {
    try {
      console.log('API - Deleting category:', data);
      const response = await api.delete('/Admin/Delete-Category', { data });
      console.log('API - Delete category response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to delete category');
      }
      throw error;
    }
  },
  getCategoryDetails: async (categoryId: number) => {
    try {
      const response = await api.get(`/Admin/Category-Details/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category details:', error);
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