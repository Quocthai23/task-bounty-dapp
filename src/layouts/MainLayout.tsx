import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { notificationService } from '@/services/notification.service';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Bell, LogOut, ChevronLeft, ChevronRight, Search, LayoutGrid, AlertCircle, Settings, ListTodo, Wallet as WalletIcon, Briefcase, History, Globe } from 'lucide-react';
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
  const { t, i18n } = useTranslation();

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

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
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
    { name: t('sidebar.manageJobs'), path: '/manage-jobs', icon: Briefcase },
    { name: t('sidebar.myProfile'), path: '/profile', icon: AlertCircle },
    { name: t('sidebar.payment'), path: '/wallet', icon: WalletIcon },
    { name: t('sidebar.myTask'), path: '/my-tasks', icon: ListTodo },
    { name: t('sidebar.taskHistory'), path: '/history', icon: History },
    { name: t('sidebar.settings'), path: '#', icon: Settings, action: () => setIsSettingsOpen(true) },
  ];

  const displayName = (user as any)?.firstName 
    ? `${(user as any)?.firstName} ${(user as any)?.lastName || ''}`.trim() 
    : (user as any)?.username || 'User';

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
              <span>{t('header.platformSubtitle')}</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Quick Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--app-surface-muted)] hover:bg-[var(--app-border)] border border-[var(--app-border)] text-xs font-bold transition-all text-[var(--app-text)] shadow-2xs cursor-pointer"
            title={t('header.switchLanguage')}
          >
            <Globe size={14} className="text-blue-500" />
            <span>{i18n.language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--app-surface-muted)] transition-colors text-[var(--app-text-muted)] cursor-pointer"
            title={t('header.themeToggle')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification Button */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-full bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-colors relative shadow-sm cursor-pointer"
            >
              <Bell size={16} />
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl shadow-xl z-50 overflow-hidden transition-colors">
                <div className="p-4 border-b border-[var(--app-border)] font-semibold">{t('header.notifications')}</div>
                <div className="p-4 text-sm text-[var(--app-text-muted)] text-center">{t('header.noNotifications')}</div>
              </div>
            )}
          </div>

          {/* User Profile Header Chip */}
          <div className="flex items-center gap-2.5 ml-1">
            <Link to="/profile" className="hover:opacity-90 transition-opacity">
              <UserAvatar user={user} size="md" showOnlineStatus />
            </Link>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-bold text-[var(--app-text)] leading-tight truncate max-w-[120px]">
                {isLoading ? '...' : displayName}
              </span>
              <span className="text-[10px] text-[var(--color-primary-500)] font-medium leading-tight truncate max-w-[120px]">
                {(user as any)?.profile?.title || t('header.role')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar container */}
        <div
          className={cn(
            "relative shrink-0 transition-all duration-300 ease-in-out h-full",
            isSidebarOpen ? "w-68" : "w-0"
          )}
        >
          {/* Actual Sidebar Content */}
          <aside
            className={cn(
              "absolute top-4 bottom-4 left-4 right-0 rounded-3xl shadow-xl transition-all duration-300 flex flex-col overflow-hidden bg-blue-600 dark:bg-slate-900 dark:border dark:border-slate-800",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full opacity-0 pointer-events-none"
            )}
          >
            {/* Top User Profile Header inside Sidebar */}
            <div className="pt-6 pb-4 px-5 flex flex-col items-center border-b border-white/15 dark:border-slate-800 shrink-0">
              <Link 
                to="/profile" 
                className="relative rounded-full border-3 border-white/80 dark:border-slate-700 shadow-md hover:scale-105 transition-transform"
                title={t('sidebar.myProfile')}
              >
                <UserAvatar user={user} size="xl" showOnlineStatus />
              </Link>
              <h3 className="text-white font-black text-base mt-2.5 leading-tight text-center truncate max-w-[200px]">
                {displayName}
              </h3>
              <p className="text-white/70 dark:text-slate-400 text-[11px] font-medium truncate max-w-[190px] mt-0.5">
                {(user as any)?.email}
              </p>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-4 px-3.5 space-y-1.5 overflow-y-auto custom-scrollbar">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path) && item.path !== '#';

                const btnClass = cn(
                  "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group text-xs font-bold cursor-pointer",
                  isActive
                    ? "bg-white text-blue-600 dark:bg-blue-600 dark:text-white shadow-sm"
                    : "text-white/85 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-slate-800/80 hover:text-white"
                );

                if (item.action) {
                  return (
                    <button key={idx} onClick={item.action} className={btnClass}>
                      <Icon size={16} className={isActive ? "text-blue-600 dark:text-white" : "group-hover:scale-110 transition-transform"} />
                      <span>{item.name}</span>
                    </button>
                  );
                }

                return (
                  <Link key={idx} to={item.path} className={btnClass}>
                    <Icon size={16} className={isActive ? "text-blue-600 dark:text-white" : "group-hover:scale-110 transition-transform"} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer: Logout */}
            <div className="p-3 shrink-0 mt-auto border-t border-white/10 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-white/80 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-800 hover:text-white transition-all group text-xs font-bold cursor-pointer"
              >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>{t('sidebar.logout')}</span>
              </button>
            </div>

            {/* Collapse Button inside sidebar */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-white/20 dark:bg-slate-800/80 rounded-l-md flex items-center justify-center text-white hover:bg-white/30 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Thu gọn sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </aside>
        </div>

        {/* Expand Sidebar Button (when collapsed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-14 bg-blue-600 dark:bg-slate-800 rounded-r-xl flex items-center justify-center text-white shadow-lg hover:w-9 transition-all z-20 cursor-pointer"
            title="Mở rộng sidebar"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-4 md:p-6 transition-all duration-300 bg-slate-50/50 dark:bg-slate-950">
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

