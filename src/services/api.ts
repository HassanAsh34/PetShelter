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
      throw error;
    }
  },
}; 