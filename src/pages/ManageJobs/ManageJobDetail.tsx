import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { taskService } from '@/services/task.service';
import { Button } from '@/components/shared/atoms/button';
import { Badge } from '@/components/shared/atoms/badge';
import { Dialog, DialogContent } from '@/components/shared/atoms/dialog';
import { CandidateProfileModal } from '@/components/features/manage-jobs/CandidateProfileModal';
import { BonusMemberModal } from '@/components/features/manage-jobs/BonusMemberModal';
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  UserCheck, 
  ArrowLeft, 
  Plus, 
  Lock, 
  Unlock, 
  Globe, 
  Mail, 
  Gift, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  ListTodo, 
  Sparkles, 
  Save, 
  Clock, 
  X,
  Wallet,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';

export const ManageJobDetail: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'escrow' | 'team' | 'applications' | 'tasks'>('team');
  
  // Modals state
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  const [selectedMemberForBonus, setSelectedMemberForBonus] = useState<any | null>(null);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);

  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [addBudgetAmount, setAddBudgetAmount] = useState<number>(500);

  // Invite by email state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'DEV' | 'LEAD_DEV' | 'REVIEWER' | 'PM'>('DEV');
  const [isInviting, setIsInviting] = useState(false);

  // Task creation state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskBudget, setTaskBudget] = useState(100);
  const [taskAssigneeId, setTaskAssigneeId] = useState('');

  // Fetch Project Detail
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['manage-project-detail', projectId],
    queryFn: () => projectService.getProjectById(projectId!),
    enabled: !!projectId,
  });

  // Local form state for Budget & Recruitment settings
  const [editBudget, setEditBudget] = useState<number>(0);
  const [editMaxMembers, setEditMaxMembers] = useState<number>(5);
  const [editIsRecruiting, setEditIsRecruiting] = useState<boolean>(true);
  const [editType, setEditType] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  if (project && !isFormInitialized) {
    setEditBudget(project.budget || 0);
    setEditMaxMembers(project.maxMembers || 5);
    setEditIsRecruiting(project.isRecruiting ?? true);
    setEditType((project.type as any) || 'PUBLIC');
    setIsFormInitialized(true);
  }

  // Update Project Mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => projectService.updateProject(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-project-detail', projectId] });
      queryClient.invalidateQueries({ queryKey: ['owned-projects'] });
      toast.success('Đã lưu cập nhật thông tin dự án!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật dự án');
    }
  });

  // Add Budget Mutation
  const addBudgetMutation = useMutation({
    mutationFn: (amountToAdd: number) => {
      const current = Number(project?.budget) || 0;
      return projectService.updateProject(projectId!, { budget: current + amountToAdd });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-project-detail', projectId] });
      queryClient.invalidateQueries({ queryKey: ['owned-projects'] });
      toast.success(`Đã nạp thêm +$${addBudgetAmount.toLocaleString()} vào ngân sách bảo chứng!`);
      setIsAddBudgetModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể nạp thêm ngân sách');
    }
  });

  // Add Member by Email Mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: any) => projectService.addMemberByEmail(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-project-detail', projectId] });
      toast.success(`Đã thêm thành viên ${inviteEmail} vào dự án!`);
      setInviteEmail('');
      setIsInviting(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể thêm thành viên. Hãy đảm bảo email đã đăng ký tài khoản.');
    }
  });

  // Update Member Permissions Mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: ({ memberId, permissions, role }: { memberId: string; permissions: string; role?: string }) =>
      projectService.updateMemberPermissions(projectId!, memberId, { permissions, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-project-detail', projectId] });
      toast.success('Đã cập nhật phân quyền thành viên!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật quyền');
    }
  });

  // Process Application Mutation
  const processApplicationMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: 'APPROVED' | 'REJECTED' }) =>
      projectService.processApplication(projectId!, appId, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['manage-project-detail', projectId] });
      toast.success(vars.status === 'APPROVED' ? 'Đã duyệt ứng viên vào dự án!' : 'Đã từ chối đơn ứng tuyển');
      setIsCandidateModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Thao tác không thành công');
    }
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => taskService.createTask(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-project-detail', projectId] });
      toast.success('Đã tạo nhiệm vụ mới!');
      setIsCreateTaskOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssigneeId('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể tạo nhiệm vụ');
    }
  });

  // Update Task Status Mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      taskService.updateTask(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-project-detail', projectId] });
      toast.success('Đã cập nhật trạng thái nhiệm vụ!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không có quyền cập nhật trạng thái');
    }
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-20 text-center text-slate-400 font-bold">
        Đang tải thông tin quản trị dự án...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full max-w-7xl mx-auto py-20 text-center space-y-4">
        <div className="text-rose-500 font-bold text-lg">
          Không tìm thấy dự án hoặc bạn không có quyền PM để quản lý dự án này.
        </div>
        <Button onClick={() => navigate('/manage-jobs')} variant="neutral-outline">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const members = project.members || [];
  const applications = project.applications || [];
  const tasks = project.tasks || [];
  const pendingApplications = applications.filter((a: any) => a.status === 'PENDING');
  const hasApplicants = applications.length > 0;

  // Handle permission toggle for a member
  const handleTogglePermission = (member: any, perm: string) => {
    const currentPerms = (member.permissions || '').split(',').map((p: string) => p.trim()).filter(Boolean);
    let newPerms: string[];
    if (currentPerms.includes(perm)) {
      newPerms = currentPerms.filter((p: string) => p !== perm);
    } else {
      newPerms = [...currentPerms, perm];
    }
    updatePermissionsMutation.mutate({
      memberId: member.id,
      permissions: newPerms.join(','),
      role: member.role,
    });
  };

  const handleSaveBudgetAndSettings = () => {
    updateProjectMutation.mutate({
      budget: Number(editBudget),
      maxMembers: Number(editMaxMembers),
      isRecruiting: editIsRecruiting,
      type: editType,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/manage-jobs')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Danh Sách Quản Lý
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            project.type === 'PUBLIC'
              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
              : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
          }`}>
            {project.type === 'PUBLIC' ? '🌐 Public Project' : '🔒 Private Project'}
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            project.isRecruiting && members.length < (project.maxMembers || 5)
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {project.isRecruiting && members.length < (project.maxMembers || 5) ? '● Đang Tuyển Người' : '● Đã Đủ Thành Viên'}
          </span>
        </div>
      </div>

      {/* Clean White Project Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" /> Bảng Điều Khiển Dự Án
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Quick Metrics & Add Budget Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-3.5 text-center min-w-[130px]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Ngân Sách Cam Kết</div>
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                ${Number(project.budget || 0).toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Thành Viên</div>
              <div className="text-xl font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                {members.length} / {project.maxMembers || 5}
              </div>
            </div>

            <Button
              onClick={() => setIsAddBudgetModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <Coins className="w-4 h-4" /> + Nạp Thêm Budget
            </Button>
          </div>
        </div>

        {/* 4 Clean Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'team'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            Đội Ngũ & Phân Quyền ({members.length})
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'escrow'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Minh Chứng Ngân Sách & Tuyển Dụng
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 relative ${
              activeTab === 'applications'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-500" />
            Đơn Ứng Tuyển ({applications.length})
            {pendingApplications.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingApplications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'tasks'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ListTodo className="w-4 h-4 text-purple-500" />
            Nhiệm Vụ & Roadmap ({tasks.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TEAM & PERMISSIONS & REWARDS                                       */}
      {/* ========================================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Header & Add Member by Email */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Danh Sách Thành Viên & Phân Quyền ({members.length} / {project.maxMembers || 5})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉ định vai trò, gán quyền tạo task, kéo Done và khen thưởng trực tiếp cho thành viên
              </p>
            </div>

            <Button
              onClick={() => setIsInviting(!isInviting)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Mời Thành Viên Theo Email
            </Button>
          </div>

          {/* Invite Form Accordion */}
          {isInviting && (
            <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-3xl p-6 space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Mời Thành Viên Trực Tiếp Vào Dự Án
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-7">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Email Thành Viên Trong Hệ Thống</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@taskbounty.com"
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Vai Trò (Role)</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DEV">DEV (Lập trình viên)</option>
                    <option value="LEAD_DEV">LEAD_DEV (Trưởng nhóm dev)</option>
                    <option value="REVIEWER">REVIEWER (Kiểm thử / Duyệt)</option>
                    <option value="PM">PM (Quản lý dự án)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Button
                    onClick={() => addMemberMutation.mutate({ email: inviteEmail, role: inviteRole })}
                    disabled={addMemberMutation.isPending || !inviteEmail.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl py-2"
                  >
                    {addMemberMutation.isPending ? 'Đang Mời...' : 'Xác Nhận'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Members Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Thành Viên</th>
                    <th className="py-4 px-4">Vai Trò</th>
                    <th className="py-4 px-4 text-center">Tạo Task (CAN_CREATE_TASK)</th>
                    <th className="py-4 px-4 text-center">Kéo Done (CAN_MOVE_DONE)</th>
                    <th className="py-4 px-4 text-center">Review (CAN_REVIEW_TASK)</th>
                    <th className="py-4 px-4">Đã Thưởng</th>
                    <th className="py-4 px-6 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {members.map((member: any) => {
                    const u = member.user || {};
                    const perms = (member.permissions || '').split(',').map((p: string) => p.trim());
                    const isOwnerOrPM = member.role === 'PM';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Member Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                u.firstName?.[0] || u.email?.[0]?.toUpperCase() || 'U'
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email?.split('@')[0]}
                              </div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-4">
                          <Badge className={`text-[10px] font-bold ${
                            member.role === 'PM' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' 
                              : member.role === 'LEAD_DEV'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {member.role}
                          </Badge>
                        </td>

                        {/* CAN_CREATE_TASK Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isOwnerOrPM || perms.includes('CAN_CREATE_TASK')}
                            disabled={isOwnerOrPM}
                            onChange={() => handleTogglePermission(member, 'CAN_CREATE_TASK')}
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer disabled:opacity-50"
                          />
                        </td>

                        {/* CAN_MOVE_DONE Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isOwnerOrPM || perms.includes('CAN_MOVE_DONE')}
                            disabled={isOwnerOrPM}
                            onChange={() => handleTogglePermission(member, 'CAN_MOVE_DONE')}
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer disabled:opacity-50"
                          />
                        </td>

                        {/* CAN_REVIEW_TASK Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isOwnerOrPM || perms.includes('CAN_REVIEW_TASK')}
                            disabled={isOwnerOrPM}
                            onChange={() => handleTogglePermission(member, 'CAN_REVIEW_TASK')}
                            className="w-4 h-4 accent-purple-600 rounded cursor-pointer disabled:opacity-50"
                          />
                        </td>

                        {/* Bonus Received */}
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            ${(member.bonusReceived || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <Button
                            onClick={() => {
                              setSelectedMemberForBonus(member);
                              setIsBonusModalOpen(true);
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold rounded-xl px-3 py-1.5 flex items-center gap-1.5 ml-auto transition-colors"
                          >
                            <Gift className="w-3.5 h-3.5" /> Thưởng Nóng
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUDGET ESCROW & RECRUITMENT SETTINGS                               */}
      {/* ========================================================================= */}
      {activeTab === 'escrow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Budget Escrow Card */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl border border-emerald-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Minh Chứng Tài Chính (Budget Escrow Proof)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mức ngân sách cam kết để ứng viên nhìn thấy năng lực chi trả của dự án
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsAddBudgetModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-3.5 py-2 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Nạp Thêm
              </Button>
            </div>

            {/* Lock Explanation Alert */}
            {hasApplicants ? (
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Ngân Sách Đã Được Khóa Cố Định (${(project.budget || 0).toLocaleString()} USD)
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  Dự án đã có <strong>{applications.length} ứng viên nộp hồ sơ ứng tuyển</strong>. Theo nguyên tắc bảo vệ quyền lợi và cam kết minh bạch, mức ngân sách không thể giảm tùy tiện. Tuy nhiên bạn luôn có thể <strong>Nạp thêm Budget</strong> bất kỳ lúc nào.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  Chưa Có Ứng Viên Nộp Đơn — Bạn Có Thể Tăng/Giảm Ngân Sách
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
                  Khi chưa có ứng viên nộp hồ sơ, PM có toàn quyền linh hoạt điều chỉnh ngân sách cam kết phù hợp với quy mô thực tế.
                </p>
              </div>
            )}

            {/* Budget Input Form */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mức Ngân Sách Dự Án ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    disabled={hasApplicants}
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl font-mono font-black text-slate-900 dark:text-white text-base border ${
                      hasApplicants 
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-not-allowed text-slate-500' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* Recruitment Expansion Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Số Thành Viên Tối Đa (Max Members)
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={members.length}
                      max="100"
                      value={editMaxMembers}
                      onChange={(e) => setEditMaxMembers(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Đang có {members.length} người. Nâng lên {editMaxMembers} để tuyển thêm.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Chế Độ Public / Private
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PUBLIC">🌐 Public (Hiển thị ra cộng đồng)</option>
                    <option value="PRIVATE">🔒 Private (Chỉ mời nội bộ)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 mt-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Bật Chế Độ Mở Tuyển Dụng (Recruiting)</div>
                  <div className="text-[11px] text-slate-500">Cho phép ứng viên ngoài cộng đồng nộp đơn apply</div>
                </div>
                <input
                  type="checkbox"
                  checked={editIsRecruiting}
                  onChange={(e) => setEditIsRecruiting(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <Button
                onClick={handleSaveBudgetAndSettings}
                disabled={updateProjectMutation.isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {updateProjectMutation.isPending ? 'Đang Lưu...' : 'Lưu Thay Đổi Thiết Lập Dự Án'}
              </Button>
            </div>
          </div>

          {/* Right Info: Project Summary & How-To */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Quy Trình Quản Trị Tuyển Người
              </h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 text-center font-bold shrink-0">1</div>
                  <p><strong>Nâng số lượng thành viên:</strong> Nếu bạn đang có 4 người và cần tuyển thêm 1 người, hãy nâng <strong>Max Members lên 5</strong> và bật <strong>Recruiting</strong>.</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 text-center font-bold shrink-0">2</div>
                  <p><strong>Duyệt ứng viên:</strong> Khi có người apply, chuyển sang tab <strong>Đơn Ứng Tuyển</strong> để xem toàn bộ Profile, CV, Kỹ năng và bấm <strong>Duyệt</strong>.</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 text-center font-bold shrink-0">3</div>
                  <p><strong>Gán quyền & Khen thưởng:</strong> Tại tab <strong>Đội Ngũ</strong>, phân quyền tạo task / kéo done và bấm <strong>Thưởng Nóng</strong> khi họ hoàn thành xuất sắc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: APPLICATIONS & CANDIDATE PROFILE REVIEW                            */}
      {/* ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Hồ Sơ Ứng Tuyển ({applications.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem chi tiết CV, kỹ năng, kinh nghiệm của ứng viên và duyệt vào làm dự án
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                {pendingApplications.length} Chờ duyệt
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                {applications.filter((a: any) => a.status === 'APPROVED').length} Đã duyệt
              </span>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <UserCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Chưa có ứng viên nộp hồ sơ</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khi dự án được bật chế độ Public, các lập trình viên ngoài cộng đồng có thể nộp đơn ứng tuyển tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app: any) => {
                const cand = app.user || {};
                const prof = cand.profile || {};

                return (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:border-blue-300 transition-colors"
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-md">
                          {cand.avatarUrl ? (
                            <img src={cand.avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            cand.firstName?.[0] || cand.email?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {cand.firstName && cand.lastName ? `${cand.firstName} ${cand.lastName}` : cand.email}
                          </div>
                          <div className="text-xs text-slate-400">{cand.email}</div>
                          {prof.headline && (
                            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                              {prof.headline}
                            </div>
                          )}
                        </div>
                      </div>

                      <Badge className={`text-[10px] font-bold ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-500 text-white'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-400 text-amber-950'
                      }`}>
                        {app.status === 'APPROVED' ? 'Đã duyệt' : app.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ duyệt'}
                      </Badge>
                    </div>

                    {/* Cover Letter Snippet */}
                    {app.coverLetter && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        "{app.coverLetter}"
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="neutral-outline"
                          onClick={() => {
                            setSelectedApplication(app);
                            setIsCandidateModalOpen(true);
                          }}
                          className="rounded-xl text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem Hồ Sơ & CV
                        </Button>

                        {app.status === 'PENDING' && (
                          <>
                            <Button
                              variant="destructive"
                              onClick={() => processApplicationMutation.mutate({ appId: app.id, status: 'REJECTED' })}
                              className="rounded-xl text-xs px-3 py-1.5"
                            >
                              Từ Chối
                            </Button>
                            <Button
                              onClick={() => processApplicationMutation.mutate({ appId: app.id, status: 'APPROVED' })}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs px-3 py-1.5"
                            >
                              Duyệt Vào Dự Án
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TASKS & ROADMAP                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Bảng Nhiệm Vụ & Phân Công ({tasks.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tạo task mới, gán thành viên chịu trách nhiệm và theo dõi tiến độ hoàn thành
              </p>
            </div>

            <Button
              onClick={() => setIsCreateTaskOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tạo Task Mới
            </Button>
          </div>

          {/* Create Task Modal / Drawer */}
          {isCreateTaskOpen && (
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Tạo Nhiệm Vụ Mới Trong Dự Án
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tiêu Đề Task *</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="VD: Viết Smart Contract Token VNDT"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Gán Cho Thành Viên</label>
                  <select
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chưa gán (Để trống)</option>
                    {members.map((m: any) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user?.firstName || m.user?.email} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Mô Tả Nhiệm Vụ</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={2}
                  placeholder="Chi tiết yêu cầu kỹ thuật và tiêu chí nghiệm thu..."
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsCreateTaskOpen(false)} className="text-xs">
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    if (!taskTitle.trim()) {
                      toast.error('Vui lòng nhập tiêu đề task');
                      return;
                    }
                    createTaskMutation.mutate({
                      title: taskTitle,
                      description: taskDesc,
                      budget: Number(taskBudget) || 0,
                      assigneeId: taskAssigneeId || undefined,
                      status: 'OPEN',
                    });
                  }}
                  disabled={createTaskMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-4 py-2"
                >
                  {createTaskMutation.isPending ? 'Đang Tạo...' : 'Tạo Task'}
                </Button>
              </div>
            </div>
          )}

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task: any) => {
              const assignee = task.assignee || {};

              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge className={`text-[10px] font-bold ${
                        task.status === 'DONE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                      }`}>
                        {task.status}
                      </Badge>
                      <span className="font-mono font-bold text-xs text-emerald-600">
                        ${task.budget || 0}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      {assignee.email ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                            {assignee.firstName?.[0] || assignee.email?.[0]?.toUpperCase()}
                          </div>
                          <span className="truncate max-w-[100px] text-slate-600 dark:text-slate-300 font-medium">
                            {assignee.firstName || assignee.email.split('@')[0]}
                          </span>
                        </>
                      ) : (
                        <span>Chưa gán</span>
                      )}
                    </div>

                    {/* Status change buttons */}
                    <div className="flex items-center gap-1">
                      {task.status !== 'DONE' && (
                        <Button
                          onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: 'DONE' })}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          Kéo Done ✓
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD BUDGET MODAL                                                          */}
      {/* ========================================================================= */}
      <Dialog open={isAddBudgetModalOpen} onOpenChange={setIsAddBudgetModalOpen}>
        <DialogContent 
          showCloseButton={false}
          className="!max-w-md w-[95vw] p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Nạp Thêm Ngân Sách</h3>
                <p className="text-xs text-slate-500">Tăng ngân sách cam kết dự án</p>
              </div>
            </div>

            <button
              onClick={() => setIsAddBudgetModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-500">Ngân sách hiện tại:</span>
              <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                ${Number(project.budget || 0).toLocaleString()} USD
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Số Tiền Muốn Nạp Thêm ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">$</span>
                <input
                  type="number"
                  min="1"
                  value={addBudgetAmount}
                  onChange={(e) => setAddBudgetAmount(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl font-mono font-black text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="500"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {[100, 250, 500, 1000, 2500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAddBudgetAmount(preset)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-colors ${
                      addBudgetAmount === preset
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    +${preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <span>Tổng ngân sách sau khi nạp:</span>
              <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-300">
                ${(Number(project.budget || 0) + Number(addBudgetAmount || 0)).toLocaleString()} USD
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="neutral-outline"
                onClick={() => setIsAddBudgetModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Hủy Bỏ
              </Button>
              <Button
                onClick={() => addBudgetMutation.mutate(Number(addBudgetAmount))}
                disabled={addBudgetMutation.isPending || addBudgetAmount <= 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-md shadow-emerald-600/20"
              >
                {addBudgetMutation.isPending ? 'Đang Nạp...' : 'Xác Nhận Nạp Thêm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        application={selectedApplication}
        onApprove={(appId) => processApplicationMutation.mutate({ appId, status: 'APPROVED' })}
        onReject={(appId) => processApplicationMutation.mutate({ appId, status: 'REJECTED' })}
        isProcessing={processApplicationMutation.isPending}
      />

      {/* Bonus Reward Modal */}
      <BonusMemberModal
        isOpen={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        member={selectedMemberForBonus}
        project={project}
        onConfirmBonus={async (memberId, amount, currency, reason) => {
          await projectService.rewardMember(projectId!, memberId, { amount, currency, reason });
          queryClient.invalidateQueries({ queryKey: ['manage-project-detail', projectId] });
        }}
      />
    </div>
  );
};
