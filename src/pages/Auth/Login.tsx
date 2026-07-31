import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/shared/atoms/input';
import { Button } from '@/components/shared/atoms/button';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (data: any) => authService.login(data),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      toast.success('Login successful!');
      window.location.href = '/dashboard';
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Login failed');
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ identifier, password });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-8" 
         style={{
           backgroundColor: 'var(--color-primary-500)',
           backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
         }}>
      
      <div className="flex w-full max-w-[1000px] overflow-hidden rounded-3xl bg-white shadow-2xl md:h-[680px]">
        {/* Left Side - Form */}
        <div className="flex flex-1 flex-col overflow-y-auto p-8 md:p-12 bg-white">
          <h2 className="mb-6 text-3xl font-extrabold text-neutral-900 text-center md:text-left mt-8">
            Sign In
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            <div className="relative">
              <Input
                autoComplete="username"
                placeholder="Enter Username or Email"
                value={identifier}
                className="h-14 pl-12 bg-neutral-50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl transition-all"
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            </div>

            <div className="relative">
              <Input
                autoComplete="current-password"
                placeholder="Enter Password"
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                className="h-14 pl-12 pr-12 bg-neutral-50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl transition-all"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {isPasswordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="rememberMe" className="text-sm font-medium text-neutral-600 cursor-pointer">
                  Remember Me
                </label>
              </div>
              <Link to="/forgot-password">
                <span className="text-primary-500 text-sm font-semibold hover:underline">
                  Forgot password?
                </span>
              </Link>
            </div>

            <Button
              variant="primary-contained"
              type="submit"
              className="mt-4 h-12 w-[120px] rounded-xl text-base font-bold shadow-lg shadow-primary-500/30 transition-transform active:scale-[0.98]"
              disabled={loginMutation.isPending || !identifier || !password}
            >
              {loginMutation.isPending ? 'Logging In...' : 'Login'}
            </Button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <p className="text-sm font-medium text-neutral-500">Or Login with</p>
            <div className="flex gap-4">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-white hover:opacity-90 transition-opacity">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </button>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:opacity-90 transition-opacity">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
            </div>
          </div>

          <p className="mt-auto pt-6 text-sm font-medium text-neutral-500 text-center md:text-left">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary-500 hover:text-primary-600 hover:underline font-bold transition-colors"
            >
              Create One
            </Link>
          </p>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden w-1/2 items-center justify-center bg-neutral-00 p-8 md:flex border-l border-neutral-100 relative">
          <img src="/assets/login_illustration.png" alt="Login Illustration" className="w-full max-w-sm object-contain" />
        </div>
      </div>
    </div>
  );
};
