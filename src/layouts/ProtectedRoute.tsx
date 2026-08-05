import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const currentUser = useAuthStore((state) => state.user);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: userService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (user) {
      login(user);
    }
  }, [user, login]);

  // If we already have currentUser in store, render immediately
  if (currentUser) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-sm font-medium">Đang kiểm tra phiên đăng nhập...</span>
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
