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
  register: async (data: any, challengeToken: string) => {
    const response = await api.post('/auth/register', data, {
      headers: {
        'x-challenge-token': challengeToken
      }
    });
    return response.data;
  },
  sendOtp: async (data: { email: string, context?: string }) => {
    const response = await api.post('/auth/send-otp', { ...data, context: data.context || 'REGISTER' });
    return response.data;
  },
  verifyOtp: async (data: { email: string; otp: string, context?: string }) => {
    const response = await api.post('/auth/verify-otp', { email: data.email, code: data.otp, context: data.context || 'REGISTER' });
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
