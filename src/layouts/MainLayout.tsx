import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { notificationService } from '@/services/notification.service';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Bell, LogOut, ChevronLeft, ChevronRight, Search, LayoutGrid, AlertCircle, Settings, ListTodo, Wallet as WalletIcon, Briefcase, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/atoms/Avatar';
import { PersonalInfoModal } from '@/components/features/profile/PersonalInfoModal';
import { SkillsModal } from '@/components/features/profile/SkillsModal';
import { ChangePasswordModal } from '@/components/features/profile/ChangePasswordModal';
import { SettingsModal } from '@/components/features/settings/SettingsModal';
import { useTranslation } from 'react-i18next';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [activeModal, setActiveModal] = useState<'personal' | 'skills' | 'password' | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: userService.getMe,
  });

  const logoutStore = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error', e);
    }
    logoutStore();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      notificationService.connectSocket();
      
      const handleRiskAlert = (data: any) => {
        // You could use toast or custom UI here
        console.log('Risk Alert:', data);
      };
      const handleBalanceWarning = (data: any) => {
        console.log('Balance Warning:', data);
      };

      notificationService.socket?.on('risk-alert', handleRiskAlert);
      notificationService.socket?.on('balance-warning', handleBalanceWarning);

      return () => {
        notificationService.socket?.off('risk-alert', handleRiskAlert);
        notificationService.socket?.off('balance-warning', handleBalanceWarning);
        notificationService.disconnectSocket();
      };
    }
  }, [user]);

  const navItems = [
    { name: t('sidebar.discover'), path: '/dashboard', icon: LayoutGrid },
    { name: 'Quản Lý Job (PM)', path: '/manage-jobs', icon: Briefcase },
    { name: t('sidebar.myProfile'), path: '/profile', icon: AlertCircle },
    { name: t('sidebar.payment') || 'Payment', path: '/wallet', icon: WalletIcon },
    { name: t('sidebar.myTask'), path: '/my-tasks', icon: ListTodo },
    { name: t('sidebar.taskHistory') || 'Lịch Sử Task', path: '/history', icon: History },
    { name: t('sidebar.settings'), path: '#', icon: Settings, action: () => setIsSettingsOpen(true) },
  ];

  return (
    <div className="flex flex-col h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-300">
      {/* Top Header */}
      <header className="h-14 bg-[var(--app-surface)]/80 backdrop-blur-md flex items-center px-4 md:px-6 border-b border-[var(--app-border)] shrink-0 z-20 transition-colors">
        {/* Brand */}
        <div className="w-56 shrink-0 flex items-center">
          <Link to="/dashboard" className="text-xl font-black text-[var(--app-text)] tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs">TB</span>
            <span>TaskBounty</span>
          </Link>
        </div>

        {/* Search Bar or Platform Tag */}
        <div className="flex-1 flex items-center px-4">
          {location.pathname !== '/dashboard' ? (
            <div className="relative w-full max-w-md flex items-center">
              <input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                className="w-full h-9 bg-[var(--app-surface-muted)] text-[var(--app-text)] rounded-full pl-4 pr-10 text-xs border border-[var(--app-border)] focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
              />
              <button className="absolute right-1.5 h-6 w-6 bg-[var(--color-primary-500)] text-white rounded-full flex items-center justify-center hover:bg-[var(--color-primary-600)] transition-colors">
                <Search size={12} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Web3 Bounty & Gig Platform</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--app-surface-muted)] transition-colors text-[var(--app-text-muted)]"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-full bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-colors relative shadow-sm"
            >
              <Bell size={18} />
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl shadow-xl z-50 overflow-hidden transition-colors">
                <div className="p-4 border-b border-[var(--app-border)] font-semibold">{t('header.notifications')}</div>
                <div className="p-4 text-sm text-[var(--app-text-muted)] text-center">{t('header.noNotifications')}</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-2">
            <Link to="/profile" className="hover:opacity-90 transition-opacity">
              <UserAvatar user={user} size="md" showOnlineStatus />
            </Link>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-bold text-[var(--app-text)] leading-tight">
                {isLoading ? '...' : (user as any)?.firstName || (user as any)?.username || 'User'}
              </span>
              <span className="text-xs text-[var(--color-primary-500)] font-medium leading-tight">
                {(user as any)?.profile?.title || t('header.role')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar container with overlap */}
        <div
          className={cn(
            "relative shrink-0 transition-all duration-300 ease-in-out h-full",
            isSidebarOpen ? "w-72" : "w-0"
          )}
        >
          {/* Actual Sidebar Content */}
          <aside
            className={cn(
              "absolute top-8 bottom-8 left-8 right-0 rounded-3xl shadow-2xl transition-transform duration-300 flex flex-col",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full opacity-0 pointer-events-none"
            )}
            style={{ backgroundColor: 'var(--color-primary-500)' }}
          >
            {/* Avatar Overlap */}
            <Link 
              to="/profile" 
              className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full border-4 border-white dark:border-slate-900 shadow-lg z-20 hover:scale-105 transition-transform"
              title="Chỉnh sửa hồ sơ"
            >
              <UserAvatar user={user} size="2xl" showOnlineStatus />
            </Link>

            <div className="pt-14 pb-5 px-6 flex flex-col items-center border-b border-white/10 shrink-0">
              <h3 className="text-white font-bold text-lg leading-tight">{(user as any)?.firstName || (user as any)?.username || 'User'}</h3>
              <p className="text-white/70 text-xs font-medium truncate max-w-[200px]">{(user as any)?.email}</p>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path) && item.path !== '#';

                const btnClass = cn(
                  "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 group text-sm font-bold",
                  isActive
                    ? "bg-white text-primary-500 shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                );

                if (item.action) {
                  return (
                    <button key={idx} onClick={item.action} className={btnClass}>
                      <Icon size={18} className={isActive ? "text-primary-500" : "group-hover:scale-110 transition-transform"} />
                      {item.name}
                    </button>
                  );
                }

                return (
                  <Link key={idx} to={item.path} className={btnClass}>
                    <Icon size={18} className={isActive ? "text-primary-500" : "group-hover:scale-110 transition-transform"} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 shrink-0 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-white/80 hover:bg-white/10 hover:text-white transition-all group text-sm font-bold"
              >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                {t('sidebar.logout')}
              </button>
            </div>

            {/* Collapse Button inside sidebar */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/20 rounded-l-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </aside>
        </div>

        {/* Expand Sidebar Button (when collapsed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-16 bg-primary-500 rounded-r-xl flex items-center justify-center text-white shadow-lg hover:w-10 transition-all z-20"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-4 md:p-6 transition-all duration-300">
          <Outlet context={{ isSidebarOpen, setIsSidebarOpen }} />
        </main>
      </div>

      {/* Modals */}
      {activeModal === 'personal' && <PersonalInfoModal user={user} onClose={() => setActiveModal(null)} />}
      {activeModal === 'skills' && <SkillsModal user={user} onClose={() => setActiveModal(null)} />}
      {activeModal === 'password' && <ChangePasswordModal onClose={() => setActiveModal(null)} />}
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};
