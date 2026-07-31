import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'PM' | 'CANDIDATE';
  walletAddress?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false, // Must be determined by a /auth/me call on load
  isLoading: false,
  
  login: (userData) => {
    // Tokens are now stored in HttpOnly cookies securely by the backend
    set({ user: userData, isAuthenticated: true, isLoading: false });
  },
  
  logout: () => {
    // Backend clears the HttpOnly cookies upon /auth/logout
    set({ user: null, isAuthenticated: false });
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
}));
