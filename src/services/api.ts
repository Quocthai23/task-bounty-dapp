import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const API_URL = (import.meta.env.VITE_API_URL || 'https://solubly-postinfective-mamie.ngrok-free.dev/api').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies automatically
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(
  (config) => {
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    const isPublicAuthRoute = ['/auth/login', '/auth/register', '/auth/send-otp', '/auth/verify-otp', '/auth/refresh'].some(
      (path) => originalRequest?.url?.includes(path)
    );

    if (error.response?.status === 401 && !originalRequest?._retry && !isPublicAuthRoute) {
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );

        isRefreshing = false;
        processQueue(null, 'refreshed');
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
