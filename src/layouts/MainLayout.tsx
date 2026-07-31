import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Bell, LogOut, User, Key, ChevronLeft, ChevronRight, Search, LayoutGrid, AlertCircle, Settings, HelpCircle, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PersonalInfoModal } from '@/components/features/profile/PersonalInfoModal';
import { SkillsModal } from '@/components/features/profile/SkillsModal';
import { ChangePasswordModal } from '@/components/features/profile/ChangePasswordModal';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [activeModal, setActiveModal] = useState<'personal' | 'skills' | 'password' | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: userService.getMe,
  });

  const handleLogout = async () => {
    try {
      // Call logout API if needed
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
    } catch (e) {
      // Ignore errors on logout
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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

  const navItems = [
    { name: 'Discover', path: '/dashboard', icon: LayoutGrid },
    { name: 'My Profile', path: '/profile', icon: AlertCircle },
    { name: 'My Task', path: '/my-tasks', icon: ListTodo },
    { name: 'Task History', path: '/history', icon: ListTodo },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col h-screen bg-neutral-50 text-foreground transition-colors duration-300">
      {/* Top Header */}
      <header className="h-20 bg-white/50 backdrop-blur-md flex items-center px-4 md:px-8 border-b border-neutral-100 shrink-0 z-10">
        {/* Brand */}
        <div className="w-64 shrink-0 flex items-center">
          <Link to="/dashboard" className="text-2xl font-black text-neutral-900 tracking-tight">
            TaskBounty
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-2xl flex items-center">
            <input
              type="text"
              placeholder="Search your jobs here..."
              className="w-full h-12 bg-white rounded-full pl-6 pr-14 text-sm focus:outline-none shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
            />
            <button className="absolute right-2 h-8 w-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm">
              <Search size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-full bg-primary-500 text-white hover:bg-red-500 transition-colors relative shadow-sm"
            >
              <Bell size={18} />
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-100 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-neutral-100 font-semibold">Notifications</div>
                <div className="p-4 text-sm text-neutral-500 text-center">No new notifications</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-2">
            <img src="/assets/avatar.png" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-bold text-neutral-900 leading-tight">
                {isLoading ? '...' : (user as any)?.firstName || (user as any)?.username || 'User'}
              </span>
              <span className="text-xs text-primary-500 font-medium leading-tight">Software developer</span>
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
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md z-20">
              <img src="/assets/avatar.png" alt="Profile" className="w-full h-full object-cover" />
            </div>

            <div className="pt-16 pb-6 px-6 flex flex-col items-center border-b border-white/10 shrink-0">
              <h3 className="text-white font-bold text-lg">{(user as any)?.firstName || (user as any)?.username || 'User'}</h3>
              <p className="text-white/70 text-xs">{(user as any)?.email}</p>
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
                Logout
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
        <main className="flex-1 flex flex-col h-full overflow-hidden p-8 transition-all duration-300">
          <Outlet context={{ isSidebarOpen, setIsSidebarOpen }} />
        </main>
      </div>

      {/* Modals */}
      {activeModal === 'personal' && <PersonalInfoModal user={user} onClose={() => setActiveModal(null)} />}
      {activeModal === 'skills' && <SkillsModal user={user} onClose={() => setActiveModal(null)} />}
      {activeModal === 'password' && <ChangePasswordModal onClose={() => setActiveModal(null)} />}
    </div>
  );
};
