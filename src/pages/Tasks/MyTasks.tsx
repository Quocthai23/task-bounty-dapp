import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { taskService } from '@/services/task.service';
import { projectService } from '@/services/project.service';
import { JobSwimlaneBoard, type ProjectGroup } from './components/JobSwimlaneBoard';
import { TaskList } from './components/TaskList';
import { TaskDetailSlider } from './components/TaskDetailSlider';
import { 
  LayoutGrid, 
  List, 
  Loader2, 
  PlusCircle, 
  Search, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  ChevronsUpDown,
  Coins,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/shared/atoms/button';

const getSavedCollapsed = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem('tb_my_tasks_collapsed');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Quick Task Modal State
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskBudget, setNewTaskBudget] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // =========================================================================
  // useRef FOR STATE MEMORIZATION (Collapsed State & View State)
  // =========================================================================
  const collapsedMapRef = useRef<Record<string, boolean>>(getSavedCollapsed());

  // State linked to ref for reactive rendering
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>(getSavedCollapsed);

  const handleToggleCollapse = (projectId: string) => {
    setCollapsedMap(prev => {
      const next = { ...prev, [projectId]: !prev[projectId] };
      collapsedMapRef.current = next;
      try {
        localStorage.setItem('tb_my_tasks_collapsed', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save collapse state', err);
      }
      return next;
    });
  };

  const handleToggleAllCollapse = (collapse: boolean) => {
    setCollapsedMap(() => {
      const next: Record<string, boolean> = {};
      allProjectIds.forEach(id => {
        next[id] = collapse;
      });
      collapsedMapRef.current = next;
      try {
        localStorage.setItem('tb_my_tasks_collapsed', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save collapse state', err);
      }
      return next;
    });
  };

  // =========================================================================
  // DATA FETCHING
  // =========================================================================
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['joined-tasks'],
    queryFn: () => taskService.getJoinedTasks(1, 150)
  });

  const { data: joinedProjectsData, isLoading: isJoinedProjectsLoading } = useQuery({
    queryKey: ['joined-projects'],
    queryFn: () => projectService.getJoinedProjects()
  });

  const { data: ownedProjectsData, isLoading: isOwnedProjectsLoading } = useQuery({
    queryKey: ['owned-projects'],
    queryFn: () => projectService.getOwnedProjects()
  });

  const isLoading = isTasksLoading || isJoinedProjectsLoading || isOwnedProjectsLoading;

  // =========================================================================
  // MUTATIONS (Update Task Status & Quick Create Task)
  // =========================================================================
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string, status: string }) => 
      taskService.updateTask(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['joined-tasks'] });
      const previousTasks = queryClient.getQueryData(['joined-tasks']);
      
      queryClient.setQueryData(['joined-tasks'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((t: any) => t.id === taskId ? { ...t, status } : t)
        };
      });

      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status });
      }

      return { previousTasks };
    },
    onError: (_err, _variables, context: any) => {
      queryClient.setQueryData(['joined-tasks'], context.previousTasks);
      toast.error('Cập nhật trạng thái nhiệm vụ thất bại');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['joined-tasks'] });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string, data: any }) =>
      taskService.createTask(projectId, data),
    onSuccess: () => {
      toast.success('Đã tạo task mới thành công!');
      setIsCreateTaskOpen(false);
      setNewTaskTitle('');
      setNewTaskBudget('');
      setNewTaskDescription('');
      queryClient.invalidateQueries({ queryKey: ['joined-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['owned-projects'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể tạo task. Vui lòng kiểm tra quyền hạn.');
    }
  });

  const handleTaskMove = (taskId: string, newStatus: string) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  const handleOpenQuickAdd = (projectId: string) => {
    setTargetProjectId(projectId);
    setIsCreateTaskOpen(true);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectId || !newTaskTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề task');
      return;
    }

    createTaskMutation.mutate({
      projectId: targetProjectId,
      data: {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        budget: Number(newTaskBudget) || 0,
        status: 'OPEN'
      }
    });
  };

  // =========================================================================
  // GROUPING LOGIC (Group tasks by Job / Project)
  // =========================================================================
  const joinedTasks = (tasksData as any)?.data || [];
  const joinedProjects = Array.isArray(joinedProjectsData) ? joinedProjectsData : (joinedProjectsData as any)?.data || [];
  const ownedProjects = Array.isArray(ownedProjectsData) ? ownedProjectsData : (ownedProjectsData as any)?.data || [];

  const { projectGroups, allProjectIds, totalStats } = useMemo(() => {
    const map = new Map<string, ProjectGroup>();

    // 1. Seed from owned projects
    ownedProjects.forEach((p: any) => {
      if (!p?.id) return;
      map.set(p.id, {
        id: p.id,
        title: p.title,
        companyName: p.companyName || p.owner?.companyName || 'Dự án của tôi (PM)',
        currency: p.currency || 'VND',
        budget: Number(p.budget || 0),
        status: p.status || 'IN_PROGRESS',
        ownerId: p.ownerId,
        tasks: []
      });
    });

    // 2. Seed from joined projects
    joinedProjects.forEach((p: any) => {
      if (!p?.id) return;
      if (!map.has(p.id)) {
        map.set(p.id, {
          id: p.id,
          title: p.title,
          companyName: p.companyName || 'Dự án tham gia',
          currency: p.currency || 'VND',
          budget: Number(p.budget || 0),
          status: p.status || 'IN_PROGRESS',
          ownerId: p.ownerId,
          tasks: []
        });
      }
    });

    // 3. Assign tasks to their respective project group
    joinedTasks.forEach((t: any) => {
      const pId = t.project?.id || t.projectId || 'other_tasks';
      const pTitle = t.project?.title || 'Nhiệm vụ cá nhân';
      const pCompany = t.project?.companyName || 'TaskBounty';
      const pCurrency = t.project?.currency || 'VND';
      const pBudget = Number(t.project?.budget || 0);

      if (!map.has(pId)) {
        map.set(pId, {
          id: pId,
          title: pTitle,
          companyName: pCompany,
          currency: pCurrency,
          budget: pBudget,
          status: 'IN_PROGRESS',
          ownerId: t.project?.ownerId,
          tasks: []
        });
      }

      const grp = map.get(pId)!;
      // Avoid duplicate tasks
      if (!grp.tasks.some(existing => existing.id === t.id)) {
        grp.tasks.push(t);
      }
    });

    // 4. Filter tasks if search term or status filter is applied
    const groupsArray: ProjectGroup[] = [];
    let totalJobsCount = 0;
    let totalTasksCount = 0;
    let totalDoneCount = 0;
    let totalInProgressCount = 0;

    map.forEach(group => {
      let filteredTasks = group.tasks;

      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase();
        filteredTasks = filteredTasks.filter(t => 
          t.title?.toLowerCase().includes(q) || 
          t.description?.toLowerCase().includes(q)
        );
      }

      if (statusFilter !== 'ALL') {
        filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
      }

      totalJobsCount += 1;
      totalTasksCount += group.tasks.length;
      totalDoneCount += group.tasks.filter(t => t.status === 'DONE').length;
      totalInProgressCount += group.tasks.filter(t => t.status === 'IN_PROGRESS').length;

      groupsArray.push({
        ...group,
        tasks: filteredTasks
      });
    });

    const projectIds = groupsArray.map(g => g.id);

    return {
      projectGroups: groupsArray,
      allProjectIds: projectIds,
      totalStats: {
        jobs: totalJobsCount,
        tasks: totalTasksCount,
        done: totalDoneCount,
        inProgress: totalInProgressCount
      }
    };
  }, [joinedTasks, joinedProjects, ownedProjects, taskSearch, statusFilter]);

  const allCollapsed = allProjectIds.length > 0 && allProjectIds.every(id => Boolean(collapsedMap[id]));

  return (
    <div className="w-full min-h-full flex flex-col font-sans space-y-5 pb-12">
      
      {/* ========================================================================= */}
      {/* WORKSPACE STATS & CONTROLS HEADER (Optimized for 14-inch screens)          */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Quick Stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  My Tasks & Workspace
                  {isLoading && <Loader2 size={18} className="animate-spin text-blue-500" />}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Quản lý và kéo thả các nhiệm vụ theo từng Job bạn đang tham gia.
                </p>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span>{totalStats.jobs} Job đang làm</span>
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{totalStats.inProgress} Đang làm</span>
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 border border-emerald-200/60 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{totalStats.done}/{totalStats.tasks} Hoàn thành</span>
              </span>
            </div>
          </div>

          {/* Action Buttons: "+ Tạo Job Mới", Expand/Collapse All, View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Collapse / Expand All Toggle */}
            <Button
              variant="outline"
              onClick={() => handleToggleAllCollapse(!allCollapsed)}
              className="text-xs font-bold px-3.5 py-2 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <ChevronsUpDown size={14} />
              <span>{allCollapsed ? 'Mở rộng tất cả' : 'Thu gọn tất cả'}</span>
            </Button>

            {/* + Tạo Job Mới Button */}
            <Button
              onClick={() => navigate('/manage-jobs')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>+ Tạo Job Mới</span>
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  viewMode === 'board' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Xem dạng Swimlane theo Job"
              >
                <LayoutGrid size={14} />
                <span>Board</span>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Xem dạng danh sách"
              >
                <List size={14} />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Lọc nhanh tên nhiệm vụ..."
              className="w-full h-9 pl-9 pr-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
            {[
              { id: 'ALL', label: 'Tất cả trạng thái' },
              { id: 'OPEN', label: 'To Do' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'REVIEW', label: 'In Review' },
              { id: 'DONE', label: 'Done' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA: JOB SWIMLANES OR COMBINED LIST                          */}
      {/* ========================================================================= */}
      <div className="flex-1">
        {isLoading && !tasksData ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400 font-bold">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <span>Đang tải không gian làm việc của bạn...</span>
          </div>
        ) : viewMode === 'board' ? (
          <JobSwimlaneBoard 
            projectGroups={projectGroups}
            onTaskMove={handleTaskMove}
            onTaskClick={setSelectedTask}
            onQuickAddTask={handleOpenQuickAdd}
            collapsedMap={collapsedMap}
            onToggleCollapse={handleToggleCollapse}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <TaskList 
              tasks={projectGroups.flatMap(g => g.tasks)} 
              onTaskClick={setSelectedTask} 
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* QUICK TASK CREATION MODAL                                                 */}
      {/* ========================================================================= */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <span>Thêm Task Mới Vào Job</span>
              </h3>
              <button 
                onClick={() => setIsCreateTaskOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chọn Job / Dự án *
                </label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Chọn Job --</option>
                  {projectGroups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề Task *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiết kế giao diện thanh toán ví PayOS..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Thưởng Bounty Task (VND)
                </label>
                <div className="relative">
                  <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    placeholder="Ví dụ: 2000000"
                    value={newTaskBudget}
                    onChange={(e) => setNewTaskBudget(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả công việc (Tùy chọn)
                </label>
                <textarea
                  rows={3}
                  placeholder="Chi tiết yêu cầu, tiêu chí hoàn thành..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  {createTaskMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  <span>Tạo Task Ngay</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TASK DETAIL SLIDER                                                        */}
      {/* ========================================================================= */}
      <TaskDetailSlider 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={(taskId, status) => handleTaskMove(taskId, status)}
      />

    </div>
  );
};

export default MyTasks;
