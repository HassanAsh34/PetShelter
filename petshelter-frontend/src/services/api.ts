import axios from 'axios';
import { getToken, removeToken, parseJwt } from '../utils/tokenUtils';

interface UserDto {
  id: number;
  uname: string;
  email: string;
  role: number;
  activated: number;
  banned: boolean;
  createdAt?: string;
  updatedAt?: string;
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

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      const decoded = parseJwt(token);
      console.log('API Request - Token Info:', {
        url: config.url,
        method: config.method,
        token,
        decodedToken: decoded,
        adminType: decoded?.AdminType,
        adminTypeType: typeof decoded?.AdminType,
      });
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/AuthApi/Login', credentials);
    return response.data;
  },
  register: async (data: RegisterData) => {
    const response = await api.post('/AuthApi/Register', data);
    return response.data;
  },
  logout: () => removeToken(),
  updateUserDetails: async (userData: UserDto): Promise<UserDto> => {
    const response = await api.put('/AuthApi/UpdateProfile', userData);
    return response.data;
  },
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await api.get('/View-Profile');
    return response.data;
  },
  deleteUser: async (userData: UserDto): Promise<void> => {
    await api.put('/AuthApi/Delete-User', userData);
  },
};

export const animalsApi = {
  getAll: (searchParams?: { name?: string }) =>
    api.get('/Adoption/List-Pets', { params: searchParams }),
  getById: (id: string) => api.get(`/Adoption/View-Pet/${id}`),
  adopt: (data: { adopterId_FK: number; petId_FK: number; shelter_FK: number }) =>
    api.post('/Adoption/Adopt', data),
  cancelAdoption: (id: number) => api.post(`/Adoption/Cancel-Adoption/${id}`),
  getAdoptionHistory: () => {
    console.log('Fetching adoption history...');
    return api.get('/Adoption/Adoption-History')
      .then(response => {
        console.log('Adoption history response:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Error fetching adoption history:', error);
        throw error;
      });
  },
};

export const adminApi = {
  getDashboardStats: () => api.get('/Admin/dashboard-stats').then((res) => res.data),
  getShelters: () => api.get('/Admin/Show-Shelters').then((res) => res.data),
  addShelter: (data: { ShelterID: number; ShelterName: string; Location: string; Phone: string; Description: string }) =>
    api.post('/Admin/Add-Shelter', data).then((res) => res.data),
  deleteShelter: (Shelter: Shelter): Promise<void> =>
    api.delete('/Admin/Delete-Shelter', { data: Shelter }).then(res => res.data),
  getShelterDetails: (id: number) =>
    api.get(`/Admin/Show-Shelters-details/${id}`).then((res) => res.data),
  getCategories: (shelterId?: number) =>
    api.get(`/Admin/Show-Categories/${shelterId}`).then((res) => res.data),
  addCategory: (data: { CategoryName: string; Shelter_FK: number }) =>
    api.post('/Admin/Add-Category', data).then((res) => res.data),
  updateCategory: (data: { CategoryId: number; CategoryName: string; Shelter_FK: number }) =>
    api.put('/Admin/Edit-Category', data).then((res) => res.data),
  deleteCategory: (data: { CategoryId: number }) =>
    api.delete('/Admin/Delete-Category', { data }).then((res) => res.data),
  getCategoryDetails: (categoryId: number) =>
    api.get(`/Admin/Category-Details/${categoryId}`).then((res) => res.data),
  listUsers: () => api.get('/Admin/List-Users').then((res) => res.data),
  getUserDetails: (userId: number, userRole: number) =>
    api.get(`/Admin/User-Details/${userId}`, { params: { userRole } }).then((res) => res.data),
  banUser: (data: UserDto) =>
    api.put('/Admin/Ban-User', data).then((res) => res.data),
  unbanUser: (data: UserDto) =>
    api.put('/Admin/Unban-User', data).then((res) => res.data),
  toggleActivation: (data: UserDto) =>
    api.put('/Admin/Activate-Deactivate-Account', data).then((res) => res.data),
  updateUser: (data: UserDto) =>
    api.put('/Admin/EditUserDetails', data).then((res) => res.data),
  deleteUser: (data: UserDto) =>
    api.put('/Admin/Delete-User', data).then((res) => res.data),
  addUser: (data: RegisterData) =>
    api.post('/Admin/Add-User', data).then((res) => res.data),
  addAdmin: (data: RegisterData) =>
    api.post('/Admin/Add-Admin', data).then((res) => res.data),
};

export const staffApi = {
  getShelterPets: () => api.get('/Staff/Get-Shelter-Pets').then((res) => res.data),
  getPetDetails: (id: number) => api.get(`/Staff/Get-Pet-Details/${id}`).then((res) => res.data),
  getCategories: () => api.get('/Staff/Get-Categories').then((res) => res.data),
  addPet: (data: any) => api.post('/Staff/Add-Pet', data).then((res) => res.data),
  updatePet: (data: any) => api.put('/Staff/Update-Pet', data).then((res) => res.data),
  deletePet: (id: number) => api.delete(`/Staff/Delete-Pet/${id}`).then((res) => res.data),
  getAdoptionRequests: () => api.get('/Staff/Get-Adoption-Requests').then((res) => res.data),
  handleAdoptionRequest: (requestId: number, approved: boolean, reason?: string) =>
    api.put(`/Staff/Handle-Adoption-Request/${requestId}`, { approved, reason }).then((res) => res.data),
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
 
export interface ShelterDto {
  shelterId: number;
  shelterName: string;
}

export interface AddShelterData {
  shelterName: string;
  shelterLocation: string;
  shelterPhone: string;
  description: string;
}

export type {};
