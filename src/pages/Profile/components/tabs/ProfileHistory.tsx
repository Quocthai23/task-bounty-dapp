import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, type NotificationItem } from '@/services/notification.service';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/shared/atoms/button';
import { toast } from 'sonner';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Briefcase, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  UserCheck, 
  Eye, 
  Send, 
  Sparkles, 
  RefreshCw, 
  CheckCheck, 
  Calendar, 
  Layers 
} from 'lucide-react';

type CategoryFilter = 'ALL' | 'DEADLINE' | 'TASK' | 'FINANCE' | 'PROFILE' | 'APPLICATION';

export const ProfileHistory: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Fetch notifications with filter
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ['notifications', selectedCategory, startDate, endDate],
    queryFn: () => notificationService.getNotifications(1, 50, selectedCategory, startDate, endDate),
    refetchInterval: 15000,
  });

  const notifications: NotificationItem[] = notificationsData?.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Real-time socket listener
  useEffect(() => {
    notificationService.connectSocket();

    const handleNewNotification = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.info('Thông báo mới:', {
        description: data?.content || 'Bạn có thông báo mới trong hệ thống.',
        icon: <Bell className="w-4 h-4 text-blue-500" />
      });
    };

    notificationService.onNotification(handleNewNotification);

    return () => {
      notificationService.offNotification(handleNewNotification);
    };
  }, [queryClient]);

  // Scan Deadlines Mutation
  const scanDeadlinesMutation = useMutation({
    mutationFn: () => notificationService.scanDeadlines(),
    onMutate: () => setIsScanning(true),
    onSuccess: (data) => {
      setIsScanning(false);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(data?.message || 'Đã kiểm tra và đồng bộ cảnh báo hạn chót!');
    },
    onError: (err: any) => {
      setIsScanning(false);
      toast.error(err.response?.data?.message || 'Không thể kiểm tra hạn chót');
    }
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    }
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleQuickDateFilter = (days: number) => {
    if (days === 0) {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
    } else {
      const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(today);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('ALL');
    setStartDate('');
    setEndDate('');
  };

  // Group notifications by relative date
  const groupedNotifications = notifications.reduce((acc: Record<string, NotificationItem[]>, item) => {
    const dateStr = format(new Date(item.createdAt), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(item);
    return acc;
  }, {});

  const getRelativeDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Hôm nay';
    if (isYesterday(d)) return 'Hôm qua';
    return format(d, 'dd/MM/yyyy');
  };

  // Helper to render type-specific icons and colors
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'DEADLINE_OVERDUE':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          badgeBg: 'bg-rose-100 text-rose-800',
          label: 'Trễ hạn',
          accent: '#e11d48'
        };
      case 'DEADLINE_APPROACHING':
        return {
          icon: <Clock className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-100 text-amber-800',
          label: 'Sắp đến hạn',
          accent: '#d97706'
        };
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATE':
        return {
          icon: <Briefcase className="w-4 h-4 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-200 text-blue-900',
          badgeBg: 'bg-blue-100 text-blue-800',
          label: 'Nhiệm vụ',
          accent: '#2563eb'
        };
      case 'DEPOSIT_SUCCESS':
        return {
          icon: <ArrowDownLeft className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          label: 'Nạp tiền',
          accent: '#059669'
        };
      case 'WITHDRAW_PENDING':
      case 'WITHDRAW_COMPLETED':
        return {
          icon: <ArrowUpRight className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-200 text-purple-900',
          badgeBg: 'bg-purple-100 text-purple-800',
          label: 'Rút tiền',
          accent: '#7c3aed'
        };
      case 'PROFILE_VIEW':
        return {
          icon: <Eye className="w-4 h-4 text-cyan-600" />,
          bg: 'bg-cyan-50 border-cyan-200 text-cyan-900',
          badgeBg: 'bg-cyan-100 text-cyan-800',
          label: 'Xem hồ sơ',
          accent: '#0891b2'
        };
      case 'PROFILE_UPDATE':
        return {
          icon: <UserCheck className="w-4 h-4 text-teal-600" />,
          bg: 'bg-teal-50 border-teal-200 text-teal-900',
          badgeBg: 'bg-teal-100 text-teal-800',
          label: 'Cập nhật Profile',
          accent: '#0d9488'
        };
      case 'APPLICATION':
      case 'APPLICATION_UPDATE':
        return {
          icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
          badgeBg: 'bg-indigo-100 text-indigo-800',
          label: 'Ứng tuyển',
          accent: '#4f46e5'
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-slate-600" />,
          bg: 'bg-slate-50 border-slate-200 text-slate-900',
          badgeBg: 'bg-slate-100 text-slate-800',
          label: 'Hệ thống',
          accent: '#475569'
        };
    }
  };

  const categories = [
    { id: 'ALL', label: 'Tất cả', count: notifications.length, icon: Layers },
    { id: 'DEADLINE', label: 'Cảnh báo hạn chót', icon: AlertTriangle, color: 'text-amber-600' },
    { id: 'TASK', label: 'Giao việc & Task', icon: Briefcase, color: 'text-blue-600' },
    { id: 'FINANCE', label: 'Nạp / Rút & Giao dịch', icon: Wallet, color: 'text-emerald-600' },
    { id: 'PROFILE', label: 'Hồ sơ & Lượt xem', icon: UserCheck, color: 'text-teal-600' },
    { id: 'APPLICATION', label: 'Ứng tuyển & Tuyển dụng', icon: Send, color: 'text-indigo-600' },
  ];

  return (
    <div className="p-4 sm:p-8 animate-in fade-in duration-300 max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner & Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-400/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                Trung Tâm Thông Báo & Nhật Ký Hoạt Động
                {unreadCount > 0 && (
                  <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                    {unreadCount} mới
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Theo dõi tức thì: Cảnh báo trễ hạn, giao việc, nạp rút tiền, ứng tuyển và ai đã xem hồ sơ của bạn.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Button
            onClick={() => scanDeadlinesMutation.mutate()}
            disabled={isScanning}
            className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Đang quét...' : 'Quét hạn chót'}
          </Button>

          {unreadCount > 0 && (
            <Button
              onClick={() => markAllReadMutation.mutate()}
              variant="outline"
              className="rounded-2xl bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              Đã đọc tất cả
            </Button>
          )}

          <Button
            onClick={() => refetch()}
            variant="outline"
            className="rounded-2xl bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm font-black scale-102'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : cat.color || 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Lọc nhanh:
            </span>
            <button
              onClick={() => handleQuickDateFilter(0)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={() => handleQuickDateFilter(3)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition-colors"
            >
              3 ngày qua
            </button>
            <button
              onClick={() => handleQuickDateFilter(7)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition-colors"
            >
              7 ngày qua
            </button>
            <button
              onClick={() => handleQuickDateFilter(30)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition-colors"
            >
              30 ngày qua
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
              title="Từ ngày"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
              title="Đến ngày"
            />
            {(startDate || endDate || selectedCategory !== 'ALL') && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 px-2 py-1"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {isLoading && (
          <div className="text-center py-12 text-slate-400 font-bold flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang tải nhật ký thông báo...</span>
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">Chưa có thông báo nào phù hợp</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Các thông báo về nhiệm vụ mới, cảnh báo trễ hạn, biến động số dư hoặc ai đã xem hồ sơ của bạn sẽ xuất hiện tại đây.
            </p>
            <Button 
              variant="outline" 
              onClick={handleClearFilters} 
              className="rounded-2xl text-xs font-bold mt-2"
            >
              Xem tất cả thông báo
            </Button>
          </div>
        )}

        {!isLoading && Object.keys(groupedNotifications).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map((dateKey) => (
          <div key={dateKey} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {getRelativeDateLabel(dateKey)}
              </span>
              <div className="flex-1 h-px bg-slate-200/80"></div>
            </div>

            <div className="space-y-2.5">
              {groupedNotifications[dateKey].map((item) => {
                const config = getTypeConfig(item.type);
                const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi });

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.isRead) markReadMutation.mutate(item.id);
                    }}
                    className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex items-start gap-3.5 sm:gap-4 relative overflow-hidden group cursor-pointer hover:shadow-md ${
                      item.isRead
                        ? 'bg-white border-slate-200/80 text-slate-800'
                        : 'bg-blue-50/40 border-blue-300/80 text-slate-900 shadow-sm'
                    }`}
                  >
                    {/* Unread Accent Bar */}
                    {!item.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                    )}

                    {/* Icon Bubble */}
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 bg-slate-50">
                      {config.icon}
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${config.badgeBg}`}>
                            {config.label}
                          </span>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">
                          {format(new Date(item.createdAt), 'HH:mm')} ({timeAgo})
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-800">
                        {item.content}
                      </p>

                      {/* Optional details metadata viewer */}
                      {item.details && typeof item.details === 'object' && Object.keys(item.details).length > 0 && (
                        <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-mono text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                          {item.details.taskTitle && (
                            <span>Task: <strong>{item.details.taskTitle}</strong></span>
                          )}
                          {item.details.projectTitle && (
                            <span>Project: <strong>{item.details.projectTitle}</strong></span>
                          )}
                          {item.details.amount && (
                            <span>Số tiền: <strong>{item.details.amount.toLocaleString()} {item.details.currency || 'VND'}</strong></span>
                          )}
                          {item.details.viewerName && (
                            <span>Người xem: <strong>{item.details.viewerName}</strong></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHistory;
