import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/shared/atoms/input';
import { Button } from '@/components/shared/atoms/button';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: (data: any) => authService.register(data),
    onSuccess: () => {
      toast.success('Registration successful!');
      navigate('/login');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Registration failed');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('You must agree to the terms');
      return;
    }

    registerMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      password: formData.password
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-8" 
         style={{
           backgroundColor: 'var(--color-primary-500)',
           backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
         }}>
      
      <div className="flex w-full max-w-[1000px] overflow-hidden rounded-3xl bg-white shadow-2xl md:h-[680px]">
        {/* Left Side - Illustration */}
        <div className="hidden w-1/2 items-center justify-center bg-neutral-00 p-8 md:flex border-r border-neutral-100">
          <img src="/assets/register_illustration.png" alt="Register Illustration" className="w-full max-w-sm object-contain" />
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-1 flex-col overflow-y-auto p-8 md:p-12 bg-white">
          <h2 className="mb-6 text-3xl font-extrabold text-neutral-900 text-center md:text-left">
            Sign Up
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="h-12 pl-11 bg-neutral-50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl transition-all"
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              </div>
              <div className="flex-1 relative">
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="h-12 pl-11 bg-neutral-50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl transition-all"
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              </div>
            </div>

            <div className="relative">
              <Input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="h-12 pl-11 bg-neutral-50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl transition-all"
                required
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            </div>

            <div className="relative">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="h-12 pl-11 bg-neutral-50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl transition-all"
                required
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            </div>

            <div className="relative">
              <Input
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="h-12 pl-11 pr-11 bg-neutral-50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl transition-all"
                required
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {isPasswordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                name="confirmPassword"
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="h-12 pl-11 pr-11 bg-neutral-50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl transition-all"
                required
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <button
                type="button"
                onClick={() => setIsConfirmPasswordVisible(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {isConfirmPasswordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="agreeTerms" className="text-sm font-medium text-neutral-600">
                I agree to all terms
              </label>
            </div>

            <Button
              variant="primary-contained"
              type="submit"
              className="mt-4 h-12 w-full rounded-xl text-base font-bold shadow-lg shadow-primary-500/30 transition-transform active:scale-[0.98]"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Registering...' : 'Register'}
            </Button>
          </form>

          <p className="mt-auto pt-6 text-center text-sm font-medium text-neutral-500">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary-500 hover:text-primary-600 hover:underline font-bold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
