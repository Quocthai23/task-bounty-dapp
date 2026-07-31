import { api } from './api';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: any;
}

export const authService = {
  login: async (data: any): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  sendOtp: async (data: { email: string }) => {
    const response = await api.post('/auth/send-otp', { ...data, context: 'REGISTER' });
    return response.data;
  },
  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await api.post('/auth/verify-otp', { email: data.email, code: data.otp, context: 'REGISTER' });
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  }
};
