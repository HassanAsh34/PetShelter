import axios from 'axios';
import { getToken, removeToken } from '../utils/tokenUtils';

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
  login: (credentials: { email: string; password: string }) =>
    api.post('/AuthApi/Login', credentials),
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/AuthApi/Register', userData),
  logout: () => {
    removeToken();
  },
};

// Animals API
export const animalsApi = {
  getAll: (searchParams?: { name?: string }) =>
    api.get('/Adoption/List-Pets', { params: searchParams }),
  getById: (id: string) => api.get(`/Adoption/View-Pet/${id}`),
  adopt: (data: { animalId: number }) => api.post('/Adoption/Adopt', data),
  cancelAdoption: (id: number) => api.post(`/Adoption/Cancel-Adoption/${id}`),
  getAdoptionHistory: () => api.get('/Adoption/Adoption-History'),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get('/Admin/dashboard-stats').then(res => res.data),
  getShelters: () => api.get('/admin/shelters'),
  addShelter: (data: any) => api.post('/admin/shelters', data),
  updateShelter: (id: number, data: any) => api.put(`/admin/shelters/${id}`, data),
  deleteShelter: (id: number) => api.delete(`/admin/shelters/${id}`),
  
  getUsers: () => api.get('/admin/users'),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
};

export type { }; 