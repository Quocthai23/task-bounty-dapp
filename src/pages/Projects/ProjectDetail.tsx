import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/shared/atoms/badge';
import { Button } from '@/components/shared/atoms/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shared/atoms/dialog';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  DollarSign, 
  Send, 
  Sliders, 
  CheckCircle2, 
  Lock, 
  Globe, 
  ArrowLeft,
  Calendar,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project-detail', id],
    queryFn: () => projectService.getProjectById(id!),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: (data: any) => projectService.applyForProject(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-detail', id] });
      toast.success('Gửi hồ sơ ứng tuyển thành công! PM sẽ xem xét và phê duyệt.');
      setIsApplyModalOpen(false);
      setCoverLetter('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể gửi hồ sơ ứng tuyển');
    }
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-12 text-center text-slate-400 font-bold">
        Đang tải thông tin dự án...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full max-w-7xl mx-auto p-12 text-center text-rose-500 font-bold">
        Không tìm thấy dự án
      </div>
    );
  }

  const members = project.members || [];
  const tasks = project.tasks || [];
  const isOwnerOrPM = project.ownerId === currentUser?.id || members.some((m: any) => m.userId === currentUser?.id && m.role === 'PM');
  const isMember = members.some((m: any) => m.userId === currentUser?.id);
  const hasApplied = (project.applications || []).some((a: any) => a.userId === currentUser?.id);

  let skills: string[] = [];
  try {
    skills = project.skillsRequired ? JSON.parse(project.skillsRequired) : [];
  } catch (e) {
    skills = project.skillsRequired ? [project.skillsRequired] : [];
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-8 pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Main Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {project.title}
              </h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                project.type === 'PUBLIC'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
              }`}>
                {project.type === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* PM Management Shortcut */}
          {isOwnerOrPM && (
            <Button
              onClick={() => navigate(`/manage-jobs/${project.id}`)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold text-xs rounded-xl px-5 py-3 shadow-md shadow-blue-600/20 flex items-center gap-2 shrink-0"
            >
              <Sliders className="w-4 h-4" /> Trang Quản Trị PM
            </Button>
          )}
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Chủ Dự Án / PM</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {project.owner?.firstName && project.owner?.lastName 
                ? `${project.owner.firstName} ${project.owner.lastName}` 
                : project.owner?.email?.split('@')[0] || 'Project Manager'}
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Ngân Sách Bảo Chứng</span>
            <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              ${(project.budget || 0).toLocaleString()} {project.currency || 'USD'}
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Quy Mô Đội Ngũ</span>
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
              {members.length} / {project.maxMembers || 5} Thành viên
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Tình Trạng Tuyển</span>
            <div className="text-sm font-bold mt-1">
              {project.isRecruiting && members.length < (project.maxMembers || 5) ? (
                <span className="text-emerald-600">● Đang mở tuyển</span>
              ) : (
                <span className="text-slate-400">● Đã đủ thành viên</span>
              )}
            </div>
          </div>
        </div>

        {/* Skills Required */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kỹ Năng Yêu Cầu</span>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          {!isMember && (
            hasApplied ? (
              <Button disabled className="bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold px-6 py-2.5">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Bạn Đã Nộp Đơn (Đang Chờ PM Duyệt)
              </Button>
            ) : project.isRecruiting && members.length < (project.maxMembers || 5) ? (
              <Button
                onClick={() => setIsApplyModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-6 py-2.5 shadow-md shadow-emerald-600/20 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Ứng Tuyển Vào Dự Án Ngay
              </Button>
            ) : (
              <Button disabled className="bg-slate-100 text-slate-400 rounded-xl text-xs font-bold px-6 py-2.5">
                Dự Án Đã Đủ Thành Viên
              </Button>
            )
          )}
        </div>
      </div>

      {/* Task Roadmap List */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Kế Hoạch & Danh Sách Nhiệm Vụ</h2>
          <p className="text-xs text-slate-500 mt-0.5">Các đầu việc và mức thưởng bounty dành cho thành viên dự án</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task: any) => (
            <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <Badge className={`text-[10px] font-bold ${
                  task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {task.status}
                </Badge>
                <span className="font-mono font-bold text-xs text-emerald-600">${task.budget || 0}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{task.title}</h3>
              {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-lg p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Ứng Tuyển Vào Dự Án</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500 leading-relaxed">
              Hồ sơ cá nhân, kỹ năng và kinh nghiệm từ trang Profile của bạn sẽ được gửi tới PM của dự án <strong>{project.title}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Thư Giới Thiệu / Lời Nhắn Đến PM (Cover Letter)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                placeholder="Giới thiệu nhanh về thế mạnh, kinh nghiệm liên quan và lý do bạn muốn tham gia dự án..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <Button
              onClick={() => applyMutation.mutate({ coverLetter })}
              disabled={applyMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
              {applyMutation.isPending ? 'Đang Gửi Hồ Sơ...' : 'Xác Nhận Nộp Đơn'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
