import { api } from './api';

export const userService = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  getPublicProfile: async (id: string) => {
    const response = await api.get(`/users/public-profile/${id}`);
    return response.data;
  }
};
