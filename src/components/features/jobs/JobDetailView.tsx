import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectService } from '@/services/project.service';
import { userService } from '@/services/user.service';
import { Button } from '@/components/shared/atoms/button';
import { SheetHeader, SheetTitle } from '@/components/shared/atoms/sheet';
import ReactMarkdown from 'react-markdown';
import { 
  CheckCircle2, 
  CircleDashed, 
  Lock, 
  Unlock, 
  Users, 
  Building2, 
  ShieldCheck, 
  BadgeCheck, 
  Calendar,
  Clock,
  Sparkles,
  Coins,
  Share2,
  ExternalLink,
  Tag,
  Copy,
  Layers,
  Send,
  UserCheck,
  Briefcase,
  AlertCircle,
  FileText,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

interface JobDetailViewProps {
  job: any;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ job: initialJob }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'escrow'>('overview');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  // Fetch full project data from API
  const { data: project = initialJob, isLoading } = useQuery({
    queryKey: ['project-detail', initialJob?.id],
    queryFn: () => projectService.getProjectById(initialJob.id),
    initialData: initialJob,
    enabled: !!initialJob?.id
  });

  // Current logged in user
  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: userService.getMe,
  });

  const applyMutation = useMutation({
    mutationFn: (text: string) => projectService.applyForProject(project.id, { coverLetter: text }),
    onSuccess: () => {
      toast.success('🎉 Đã nộp hồ sơ ứng tuyển thành công! PM sẽ xem xét và phản hồi sớm nhất.');
      setIsApplyModalOpen(false);
      setCoverLetter('');
      queryClient.invalidateQueries({ queryKey: ['project-detail', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại!';
      toast.error(msg);
    }
  });

  const budget = Number(project.budget || 0);
  const currency = project.currency || 'VND';
  const budgetUsd = (currency === 'USD' ? budget : budget / 25450).toFixed(2);
  const isEscrowed = project.isEscrowed ?? true;

  // Parse skills
  let skills: string[] = [];
  if (project.skillsRequired) {
    try {
      skills = typeof project.skillsRequired === 'string' 
        ? JSON.parse(project.skillsRequired) 
        : project.skillsRequired;
    } catch {
      skills = [project.skillsRequired];
    }
  }
  if (!Array.isArray(skills)) {
    skills = [];
  }

  // Relations
  const members = project.members || [];
  const tasks = project.tasks || [];
  const applications = project.applications || [];

  // Check roles & status
  const isOwner = currentUser && (project.ownerId === currentUser.id || members.some((m: any) => m.userId === currentUser.id && m.role === 'PM'));
  const isMember = currentUser && members.some((m: any) => m.userId === currentUser.id);
  const existingApplication = currentUser && applications.find((a: any) => a.userId === currentUser.id || a.user?.id === currentUser.id);
  const isApplied = Boolean(existingApplication);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết dự án vào clipboard!');
    }
  };

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(project.id);
      toast.success('Đã sao chép mã định danh Job ID!');
    }
  };

  let formattedDate = 'Gần đây';
  try {
    formattedDate = format(new Date(project.createdAt), 'dd MMMM, yyyy', { locale: vi });
  } catch {
    formattedDate = 'Gần đây';
  }

  return (
    <div className="h-full flex flex-col font-sans text-slate-900 bg-white dark:bg-slate-900 dark:text-white">
      
      {/* ========================================================================= */}
      {/* STICKY TOP HEADER                                                         */}
      {/* ========================================================================= */}
      <SheetHeader className="px-6 sm:px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0 sticky top-0 z-20 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            project.status === 'OPEN' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${project.status === 'OPEN' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            {project.status === 'OPEN' ? 'Đang Mở Tuyển (Open)' : 'Đang Thực Hiện (In Progress)'}
          </span>

          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
            ID: #{project.id?.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyId}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Sao chép Job ID"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Chia sẻ liên kết nhiệm vụ"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </SheetHeader>

      {/* ========================================================================= */}
      {/* MAIN SCROLLABLE CONTENT                                                   */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
        
        {/* Title, Badge & Meta Section */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
              project.type === 'PUBLIC'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800'
            }`}>
              {project.type === 'PUBLIC' ? '🌐 Bounty Công Khai' : '🔒 Nhiệm Vụ Kín'}
            </span>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              Độ ưu tiên: {project.priority || 'Tiêu chuẩn'}
            </span>

            {isEscrowed && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Đã Ký Quỹ Bảo Chứng
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-blue-600" />
              {project.companyName || project.owner?.firstName ? `${project.owner?.firstName} ${project.owner?.lastName || ''}` : 'TaskBounty Client'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Ngày đăng: {formattedDate}
            </span>
            {project.deadline && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <Clock className="w-3.5 h-3.5" /> Hạn chót: {format(new Date(project.deadline), 'dd/MM/yyyy')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PREMIUM BOUNTY & ESCROW SHOWCASE CARD                                     */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-blue-500/10 p-6 sm:p-7 rounded-3xl border border-emerald-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute -right-8 -top-8 text-emerald-500/10 pointer-events-none">
            <ShieldCheck size={180} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" /> Tổng Ngân Sách Phần Thưởng (Bounty Escrow)
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                  {budget.toLocaleString()} <span className="text-xl font-sans font-bold">{currency === 'USD' ? '$ USD' : '₫ VND'}</span>
                </p>
                {currency !== 'USD' && (
                  <p className="text-xs font-bold text-emerald-700/70 dark:text-emerald-300/70 font-mono">
                    ≈ ${budgetUsd} USD
                  </p>
                )}
              </div>
            </div>

            <div className="md:text-right">
              {isEscrowed ? (
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-emerald-500/30 p-4 rounded-2xl inline-flex flex-col items-start md:items-end gap-1 shadow-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-black text-xs">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Hợp Đồng Ký Quỹ Đã Khóa Quỹ
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Bảo đảm 100% tự động chuyển ví khi nghiệm thu
                  </span>
                </div>
              ) : (
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-amber-500/30 p-4 rounded-2xl inline-flex flex-col items-start md:items-end gap-1">
                  <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                    <Unlock size={16} />
                    Chưa ký quỹ bảo đảm
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-5 pt-3 border-t border-emerald-500/20 text-xs font-semibold text-emerald-800/80 dark:text-emerald-300/80 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Cơ chế minh chứng tài chính: Ngân sách được khóa an toàn, tự động thanh toán khi PM phê duyệt hoàn thành.</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABBED NAVIGATION BAR                                                     */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Tổng Quan & Yêu Cầu
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Nhiệm Vụ Con ({tasks.length})
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'team'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Đội Ngũ ({members.length})
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'escrow'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Điều Khoản Escrow
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & REQUIREMENTS                                            */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Detailed Overview Markdown */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <CircleDashed size={14} className="text-blue-600" /> Mô Tả Chi Tiết Mục Tiêu
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
                <ReactMarkdown>{project.description || 'Chưa có mô tả chi tiết cho nhiệm vụ này.'}</ReactMarkdown>
              </div>
            </div>

            {/* Required Skills & Positions Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required Skills */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-3">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-500" /> Kỹ Năng Yêu Cầu (Tech Stack)
                </p>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s: string) => (
                      <span key={s} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-2xs text-slate-800 dark:text-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Không có yêu cầu kỹ năng cụ thể</p>
                )}
              </div>

              {/* Recruitment Slots */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl flex flex-col justify-between space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-500" /> Quy Mô & Vị Trí Tuyển Dụng
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {members.length} / {project.maxMembers || project.positions || 5}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5">thành viên đã gia nhập</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold">
                    <Users size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SUB-TASKS LIST                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Các Gói Nhiệm Vụ Con ({tasks.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Nhiệm vụ được phân công và nghiệm thu theo tiến độ
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="p-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Chưa có task con nào được tạo</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Project Manager sẽ khởi tạo và phân chia các task con cụ thể ngay sau khi hoàn tất tuyển chọn thành viên.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((taskItem: any, idx: number) => {
                  const statusMap: Record<string, { label: string; bg: string }> = {
                    OPEN: { label: 'To Do', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300' },
                    IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' },
                    REVIEW: { label: 'In Review', bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300' },
                    DONE: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' },
                  };
                  const st = statusMap[taskItem.status] || { label: taskItem.status, bg: 'bg-slate-100 text-slate-600' };

                  return (
                    <div
                      key={taskItem.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-4 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-xs font-mono text-slate-500">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {taskItem.title}
                          </h4>
                          {taskItem.assignee ? (
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <span>Phụ trách:</span>
                              <span className="font-bold text-slate-600 dark:text-slate-300">
                                {taskItem.assignee.firstName || taskItem.assignee.email}
                              </span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-0.5">Chưa phân công</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {taskItem.budget > 0 && (
                          <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                            ${Number(taskItem.budget).toLocaleString()}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${st.bg}`}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TEAM & PROJECT MANAGER                                             */}
        {/* ========================================================================= */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* PM Card */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Chủ Dự Án / Project Manager (PM)
              </h3>
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-3xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={project.owner?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.ownerId || 'pm'}`}
                    alt="PM Avatar"
                    className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {project.owner?.firstName ? `${project.owner.firstName} ${project.owner.lastName || ''}` : 'TaskBounty Manager'}
                      </span>
                      <span title="Xác thực PM">
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{project.owner?.email || 'pm@taskbounty.io'}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Project Lead
                </span>
              </div>
            </div>

            {/* Current Members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thành Viên Dự Án ({members.length})
                </h3>
              </div>

              {members.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Chưa có thành viên nào tham gia</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {members.map((m: any, idx: number) => {
                    const u = m.user || {};
                    return (
                      <div
                        key={m.id || idx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id || idx}`}
                            alt="Member Avatar"
                            className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                              {u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email || 'Member'}
                            </p>
                            <p className="text-[10px] text-slate-400">{m.role || 'Contributor'}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                          {m.role || 'DEV'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ESCROW RULES & PROCESS                                             */}
        {/* ========================================================================= */}
        {activeTab === 'escrow' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Quy Trình & Cam Kết Bounty Minh Bạch
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">1</div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">1. Nộp hồ sơ ứng tuyển</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Gửi thư tự giới thiệu, kỹ năng phù hợp và sản phẩm đã thực hiện để PM duyệt hồ sơ.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 font-bold text-xs flex items-center justify-center">2</div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">2. Phê duyệt & Phân quyền</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    PM chấp thuận sẽ cấp quyền truy cập bảng nhiệm vụ Kanban nội bộ và phân chia task.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 font-bold text-xs flex items-center justify-center">3</div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">3. Thực thi & Báo cáo</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Thực hiện nhiệm vụ, trao đổi trực tiếp trong task slider và gửi yêu cầu Review khi xong.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">4</div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">4. Nghiệm thu & Rút tiền</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tiền thưởng Bounty được giải ngân tự động từ quỹ Escrow trực tiếp vào ví của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* STICKY BOTTOM ACTION BAR                                                  */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0 sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-3">
        {isOwner ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4" /> Bạn là Quản trị viên (PM) của dự án này
            </span>
            <Button
              onClick={() => navigate(`/manage-jobs/${project.id}`)}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white shadow-md cursor-pointer flex items-center gap-2"
            >
              Vào Trung Tâm Quản Trị PM <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ) : isMember ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Bạn đã là thành viên trong dự án này
            </span>
            <Button
              onClick={() => navigate('/my-tasks')}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer flex items-center gap-2"
            >
              Vào Bảng Không Gian Nhiệm Vụ <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ) : isApplied ? (
          <div className="w-full flex items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Đã nộp hồ sơ ứng tuyển (Đang chờ PM xét duyệt)
              </span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
              PENDING
            </span>
          </div>
        ) : (
          <Button
            onClick={() => setIsApplyModalOpen(true)}
            className="w-full h-12 rounded-2xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-101 cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Ứng Tuyển Nhiệm Vụ (Apply Now) 🚀
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* APPLICATION MODAL / DRAWER                                                */}
      {/* ========================================================================= */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Nộp Hồ Sơ Ứng Tuyển Nhiệm Vụ
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dự án: {project.title}
                </p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyMutation.mutate(coverLetter);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Thư Giới Thiệu & Năng Lực (Cover Letter) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  required
                  placeholder="Mô tả kinh nghiệm của bạn, link portfolio / github hoặc lý do bạn phù hợp với nhiệm vụ này..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <span>Hồ sơ và thông tin profile của bạn sẽ được gửi trực tiếp đến Project Manager để xem xét và cấp quyền thực thi.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="neutral-outline"
                  onClick={() => setIsApplyModalOpen(false)}
                  disabled={applyMutation.isPending}
                  className="rounded-xl text-xs px-4"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={applyMutation.isPending || !coverLetter.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-6 shadow-sm"
                >
                  {applyMutation.isPending ? 'Đang Gửi...' : 'Gửi Hồ Sơ Ứng Tuyển'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default JobDetailView;
