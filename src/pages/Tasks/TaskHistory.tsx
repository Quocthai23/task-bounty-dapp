import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { taskService } from '@/services/task.service';
import { projectService } from '@/services/project.service';
import { UserAvatar } from '@/components/shared/atoms/Avatar';
import { TaskDetailSlider } from './components/TaskDetailSlider';
import { 
  History, 
  Search, 
  RefreshCw, 
  ArrowRight, 
  MessageSquare, 
  PlusCircle, 
  UserCheck, 
  ChevronDown,
  Activity,
  FolderGit2,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

export const TaskHistory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  // Filters State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Fetch User Projects for the filter dropdown
  const { data: ownedProjects = [] } = useQuery({
    queryKey: ['projects', 'owned'],
    queryFn: projectService.getOwnedProjects,
  });

  const { data: joinedProjects = [] } = useQuery({
    queryKey: ['projects', 'joined'],
    queryFn: projectService.getJoinedProjects,
  });

  const allProjects = useMemo(() => {
    const list = [...(Array.isArray(ownedProjects) ? ownedProjects : []), ...(Array.isArray(joinedProjects) ? joinedProjects : [])];
    const map = new Map();
    list.forEach(p => {
      if (p && p.id && !map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  }, [ownedProjects, joinedProjects]);

  // Fetch Task History Activities
  const { data: historyRes, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['task-history', selectedProjectId, selectedAction, searchQuery, startDate, endDate],
    queryFn: () => taskService.getTaskHistory({
      projectId: selectedProjectId,
      action: selectedAction,
      search: searchQuery,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit: 50,
    }),
    refetchInterval: 15000, // Refresh automatically every 15s
  });

  const activities = historyRes?.data || [];

  // Summary counts
  const stats = useMemo(() => {
    let moved = 0;
    let created = 0;
    let comments = 0;
    let assigned = 0;

    activities.forEach((act: any) => {
      if (act.action === 'TASK_STATUS_CHANGED' || act.action === 'TASK_MOVED') moved++;
      else if (act.action === 'TASK_CREATED') created++;
      else if (act.action === 'TASK_COMMENT_ADDED') comments++;
      else if (act.action === 'TASK_ASSIGNED') assigned++;
    });

    return { total: activities.length, moved, created, comments, assigned };
  }, [activities]);

  const handleRefresh = async () => {
    await refetch();
    toast.success(t('taskHistory.refreshSuccess'));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{t('taskHistory.statusDone')}</span>;
      case 'REVIEW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">{t('taskHistory.statusReview')}</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">{t('taskHistory.statusInProgress')}</span>;
      case 'TODO':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{t('taskHistory.statusTodo')}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50/50 dark:bg-slate-950">
      
      {/* Top Header */}
      <div className="p-5 sm:p-6 lg:p-8 pb-4 bg-white dark:bg-slate-900 border-b border-neutral-200/70 dark:border-slate-800 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <History className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('taskHistory.title')}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Log
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('taskHistory.subtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
              <span>{t('taskHistory.refreshBtn')}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-sm">
              {stats.total}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t('taskHistory.totalActivities')}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">Recent</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-sm">
              {stats.moved}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t('taskHistory.statusChanges')}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">Kanban</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-sm">
              {stats.created}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t('taskHistory.tasksCreated')}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">New</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-sm">
              {stats.comments}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t('taskHistory.commentsCount')}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">Discussions</span>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Project Selector */}
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="appearance-none h-9 pl-3.5 pr-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
              >
                <option value="ALL">📁 {t('taskHistory.allProjects')} ({allProjects.length})</option>
                {allProjects.map((proj: any) => (
                  <option key={proj.id} value={proj.id}>
                    💼 {proj.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Action Type Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              {[
                { id: 'ALL', label: t('taskHistory.allActions') },
                { id: 'TASK_STATUS_CHANGED', label: `🎯 ${t('taskHistory.actionStatusChanged')}` },
                { id: 'TASK_CREATED', label: `✨ ${t('taskHistory.actionCreated')}` },
                { id: 'TASK_COMMENT_ADDED', label: `💬 ${t('taskHistory.actionComment')}` },
                { id: 'TASK_ASSIGNED', label: `👤 ${t('taskHistory.actionAssigned')}` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedAction(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedAction === tab.id
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('taskHistory.searchActivity')}
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

        </div>
      </div>

      {/* Main Timeline Activity Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          
          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="animate-pulse flex items-start gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-1">
                {t('taskHistory.emptyTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                {t('taskHistory.emptyDesc')}
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 space-y-4">
              
              {activities.map((act: any) => {
                const user = act.user;
                const details = act.details || {};
                const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.username || user?.email || 'User');
                const roleTitle = user?.profile?.title || 'Member';

                let timeFormatted = 'Just now';
                try {
                  timeFormatted = formatDistanceToNow(new Date(act.createdAt), { 
                    addSuffix: true, 
                    locale: i18n.language === 'vi' ? vi : enUS 
                  });
                } catch {}

                const fullDate = format(new Date(act.createdAt), 'dd/MM/yyyy HH:mm');

                return (
                  <div 
                    key={act.id} 
                    className="relative group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all duration-200"
                  >
                    {/* Timeline Node Point */}
                    <div className="absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      
                      {/* Left: User & Action Summary */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <UserAvatar user={user} size="lg" showOnlineStatus />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-black text-slate-900 dark:text-white text-sm">
                              {fullName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                              {roleTitle}
                            </span>
                            <span className="text-[11px] text-slate-400" title={fullDate}>
                              • {timeFormatted}
                            </span>
                          </div>

                          {/* Action Details Content */}
                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                            
                            {/* STATUS CHANGED / DRAGGED */}
                            {(act.action === 'TASK_STATUS_CHANGED' || act.action === 'TASK_MOVED') && (
                              <div className="space-y-2">
                                <p>
                                  {i18n.language === 'vi' ? 'đã kéo chuyển trạng thái nhiệm vụ' : 'moved task status'}{' '}
                                  <span className="font-bold text-slate-900 dark:text-white underline decoration-blue-500/30">
                                    "{details.taskTitle || 'Task'}"
                                  </span>:
                                </p>
                                <div className="flex items-center gap-2 flex-wrap bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 inline-flex">
                                  {getStatusBadge(details.fromStatus)}
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                  {getStatusBadge(details.toStatus)}
                                </div>
                              </div>
                            )}

                            {/* TASK CREATED */}
                            {act.action === 'TASK_CREATED' && (
                              <div className="space-y-1.5">
                                <p>
                                  {i18n.language === 'vi' ? 'đã tạo mới một nhiệm vụ trong Job:' : 'created a new task in Job:'}{' '}
                                  <span className="font-black text-blue-600 dark:text-blue-400">
                                    "{details.taskTitle || 'Task'}"
                                  </span>
                                </p>
                                {details.priority && (
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <span>Priority: <strong>{details.priority}</strong></span>
                                    {details.assigneeName && <span>• Assigned: <strong>{details.assigneeName}</strong></span>}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* COMMENT ADDED */}
                            {act.action === 'TASK_COMMENT_ADDED' && (
                              <div className="space-y-2">
                                <p>
                                  {i18n.language === 'vi' ? 'đã bình luận trao đổi trong nhiệm vụ' : 'commented on task'}{' '}
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    "{details.taskTitle || 'Task'}"
                                  </span>:
                                </p>
                                <div className="bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-3 text-slate-800 dark:text-slate-200 font-medium italic text-xs">
                                  "{details.content || details.contentPreview || '...'}"
                                </div>
                              </div>
                            )}

                            {/* TASK ASSIGNED */}
                            {act.action === 'TASK_ASSIGNED' && (
                              <p>
                                {i18n.language === 'vi' ? 'đã phân công nhiệm vụ' : 'assigned task'}{' '}
                                <span className="font-bold text-slate-900 dark:text-white">
                                  "{details.taskTitle || 'Task'}"
                                </span>{' '}
                                {i18n.language === 'vi' ? 'cho' : 'to'} <strong>{details.assigneeName || 'Member'}</strong>.
                              </p>
                            )}

                            {/* GENERAL UPDATE */}
                            {act.action === 'TASK_UPDATED' && (
                              <p>
                                {i18n.language === 'vi' ? 'đã cập nhật thông tin nhiệm vụ' : 'updated task info'}{' '}
                                <span className="font-bold text-slate-900 dark:text-white">
                                  "{details.taskTitle || 'Task'}"
                                </span>.
                              </p>
                            )}

                          </div>
                        </div>
                      </div>

                      {/* Right: Job Tag & Quick Action */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                        {details.projectTitle && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                            <FolderGit2 className="w-3 h-3 text-blue-500" />
                            <span className="max-w-[140px] truncate">{details.projectTitle}</span>
                          </span>
                        )}

                        {details.taskId && (
                          <button
                            onClick={() => setSelectedTask({ id: details.taskId, title: details.taskTitle, projectId: details.projectId })}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{i18n.language === 'vi' ? 'Xem chi tiết' : 'View Details'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>

      {/* Task Detail Slider Drawer (if clicked from history) */}
      {selectedTask && (
        <TaskDetailSlider
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={async (taskId, newStatus) => {
            await taskService.updateTask(taskId, { status: newStatus });
            queryClient.invalidateQueries({ queryKey: ['task-history'] });
            setSelectedTask((prev: any) => prev ? { ...prev, status: newStatus } : null);
          }}
        />
      )}

    </div>
  );
};
