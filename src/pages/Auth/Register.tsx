import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/shared/atoms/input';
import { Button } from '@/components/shared/atoms/button';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  
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

  const sendOtpMutation = useMutation({
    mutationFn: (email: string) => authService.sendOtp({ email, context: 'REGISTER' }),
    onSuccess: () => {
      toast.success(t('auth.otpSentToast'));
      setStep(2);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t('auth.failedToSendOtp');
      setError(msg);
      toast.error(msg);
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { email: string, otp: string }) => authService.verifyOtp({ ...data, context: 'REGISTER' }),
    onSuccess: (data: any) => {
      // Once OTP is verified, call register with challenge token
      const token = data.challengeToken || data.challenge_token;
      registerMutation.mutate({
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password
        },
        challengeToken: token
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t('auth.invalidOtp');
      setError(msg);
      toast.error(msg);
    }
  });

  const registerMutation = useMutation({
    mutationFn: (params: { data: any, challengeToken: string }) => authService.register(params.data, params.challengeToken),
    onSuccess: () => {
      toast.success(t('auth.registerSuccess'));
      navigate('/login');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }
    
    if (!formData.agreeTerms) {
      setError(t('auth.agreeTermsError'));
      return;
    }

    sendOtpMutation.mutate(formData.email);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length < 6) {
      setError(t('auth.pleaseEnterOtp'));
      return;
    }

    verifyOtpMutation.mutate({ email: formData.email, otp });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 md:p-8">
      
      <div className="flex w-full max-w-[1000px] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xl md:h-[680px]">
        {/* Left Side - Illustration */}
        <div className="hidden w-1/2 items-center justify-center bg-blue-600 p-8 md:flex">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">{t('auth.joinTaskBounty')}</h1>
            <p className="text-blue-100 text-lg">{t('auth.joinSubtitle')}</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-1 flex-col overflow-y-auto p-8 md:p-12 bg-white">
          {step === 1 && (
            <>
              <h2 className="mb-6 text-3xl font-bold text-slate-900 text-center md:text-left">
                {t('auth.signUpTitle')}
              </h2>

              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 font-medium">
                  {error}
                </div>
              )}

              <form className="flex flex-col gap-4" onSubmit={handleStep1}>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Input
                      name="firstName"
                      placeholder={t('auth.firstName')}
                      value={formData.firstName}
                      onChange={handleChange}
                      className="h-12 pl-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all"
                      required
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      name="lastName"
                      placeholder={t('auth.lastName')}
                      value={formData.lastName}
                      onChange={handleChange}
                      className="h-12 pl-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all"
                      required
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    name="username"
                    placeholder={t('auth.username')}
                    value={formData.username}
                    onChange={handleChange}
                    className="h-12 pl-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all"
                    required
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>

                <div className="relative">
                  <Input
                    name="email"
                    type="email"
                    placeholder={t('auth.emailAddress')}
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 pl-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>

                <div className="relative">
                  <Input
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 pl-11 pr-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={isConfirmPasswordVisible ? 'text' : 'password'}
                    placeholder={t('auth.confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-12 pl-11 pr-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <button
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {isConfirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="agreeTerms" className="text-sm font-medium text-slate-600">
                    {t('auth.agreeTerms')}{' '}
                    <Link to="/terms" className="text-blue-600 font-bold hover:underline">{t('auth.terms')}</Link>{' '}
                    {t('auth.and')}{' '}
                    <Link to="/privacy" className="text-blue-600 font-bold hover:underline">{t('auth.privacy')}</Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="mt-4 h-12 rounded-xl text-base font-bold transition-transform active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending ? t('auth.sendingOtp') : t('auth.nextStep')}
                </Button>

                <p className="mt-6 text-center text-sm font-medium text-slate-600">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <Link to="/login" className="text-blue-600 font-bold hover:underline">
                    {t('auth.signInNow')}
                  </Link>
                </p>
              </form>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col h-full">
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 w-fit"
              >
                <ArrowLeft size={16} className="mr-1" /> {t('auth.back')}
              </button>
              
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="text-blue-600 w-8 h-8" />
                </div>
                
                <h2 className="mb-2 text-2xl font-bold text-slate-900 text-center">
                  {t('auth.verifyEmailTitle')}
                </h2>
                <p className="text-slate-500 text-center mb-8">
                  {t('auth.verifyEmailDesc')} <br/>
                  <span className="font-bold text-slate-900">{formData.email}</span>
                </p>

                {error && (
                  <div className="mb-6 w-full p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 font-medium text-center">
                    {error}
                  </div>
                )}

                <form className="w-full flex flex-col gap-4" onSubmit={handleStep2}>
                  <div className="relative">
                    <Input
                      name="otp"
                      placeholder={t('auth.enterOtpPlaceholder')}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-14 text-center text-2xl tracking-widest bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all font-bold"
                      required
                      maxLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="mt-4 h-12 w-full rounded-xl text-base font-bold transition-transform active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={verifyOtpMutation.isPending || registerMutation.isPending}
                  >
                    {(verifyOtpMutation.isPending || registerMutation.isPending) ? t('auth.verifying') : t('auth.registerBtn')}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
