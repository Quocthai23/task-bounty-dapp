import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { notificationService, type NotificationItem } from '@/services/notification.service';
import { projectService } from '@/services/project.service';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Gift, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export const NotificationDropdown: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'INVITE' | 'BONUS'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: () => notificationService.getNotifications(1, 30),
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
  });

  const notifications: NotificationItem[] = data?.notifications || (Array.isArray(data) ? data : []);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    },
  });

  // Accept Project Invitation
  const acceptInviteMutation = useMutation({
    mutationFn: async ({ projectId, notifId }: { projectId: string; notifId: string }) => {
      await projectService.acceptInvitation(projectId);
      await notificationService.markAsRead(notifId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      queryClient.invalidateQueries({ queryKey: ['joined-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('🎉 Bạn đã chấp nhận lời mời tham gia dự án thành công!');
      navigate(`/jobs/${vars.projectId}`);
      setIsOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi chấp nhận lời mời');
    },
  });

  // Reject Project Invitation
  const rejectInviteMutation = useMutation({
    mutationFn: async ({ projectId, notifId }: { projectId: string; notifId: string }) => {
      await projectService.rejectInvitation(projectId);
      await notificationService.markAsRead(notifId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      toast.info('Đã từ chối lời mời tham gia dự án');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi từ chối lời mời');
    },
  });

  // Filter items
  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'UNREAD') return !item.isRead;
    if (filter === 'INVITE') return item.type === 'PROJECT_INVITE' || item.content.includes('lời mời');
    if (filter === 'BONUS') return item.type === 'BONUS' || item.content.includes('thưởng');
    return true;
  });

  const parseDetails = (details: any) => {
    if (!details) return null;
    if (typeof details === 'object') return details;
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  };

  const getIcon = (type: string, content: string) => {
    if (type === 'BONUS' || content.includes('thưởng')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
          <Gift className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'PROJECT_INVITE' || content.includes('lời mời')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4" />
        </div>
      );
    }
    if (content.includes('hạn') || content.includes('deadline')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-colors relative shadow-sm cursor-pointer flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-900 shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-84 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all flex flex-col max-h-[550px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Thông Báo</span>
              {unreadCount > 0 && (
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
            {(
              [
                { key: 'ALL', label: 'Tất cả' },
                { key: 'UNREAD', label: `Chưa đọc (${unreadCount})` },
                { key: 'INVITE', label: 'Lời mời Job' },
                { key: 'BONUS', label: 'Thưởng 🎁' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === item.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-xs">Đang tải thông báo...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không có thông báo nào trong mục này
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const details = parseDetails(notif.details);
                const isInvite = notif.type === 'PROJECT_INVITE' || (details && details.projectId);

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) markReadMutation.mutate(notif.id);
                    }}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors flex gap-3 items-start group relative ${
                      !notif.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {getIcon(notif.type, notif.content)}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-900 dark:text-slate-100 font-medium leading-snug">
                        {notif.content}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        )}
                      </div>

                      {/* Interactive Buttons for Project Invitations */}
                      {isInvite && details?.projectId && (
                        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptInviteMutation.mutate({
                                projectId: details.projectId,
                                notifId: notif.id,
                              });
                            }}
                            disabled={acceptInviteMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Chấp nhận
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rejectInviteMutation.mutate({
                                projectId: details.projectId,
                                notifId: notif.id,
                              });
                            }}
                            disabled={rejectInviteMutation.isPending}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 text-slate-600 dark:text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center justify-center gap-1 w-full cursor-pointer py-1"
            >
              Xem tất cả lịch sử hoạt động <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
