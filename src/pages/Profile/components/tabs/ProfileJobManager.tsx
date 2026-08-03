import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectService } from '@/services/project.service';
import { Button } from '@/components/shared/atoms/button';
import { CreateProjectModal } from '@/components/features/manage-jobs/CreateProjectModal';
import { 
  Briefcase, 
  Plus, 
  Users, 
  DollarSign, 
  ArrowRight, 
  ExternalLink, 
  Globe, 
  Lock, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const ProfileJobManager: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: ownedProjects = [], isLoading } = useQuery({
    queryKey: ['owned-projects'],
    queryFn: () => projectService.getOwnedProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owned-projects'] });
      setIsCreateModalOpen(false);
    }
  });

  const totalProjects = ownedProjects.length;
  const totalBudget = ownedProjects.reduce((sum: number, p: any) => sum + (Number(p.budget) || 0), 0);
  const totalMembers = ownedProjects.reduce((sum: number, p: any) => sum + (p.members?.length || 0), 0);
  const totalPendingApps = ownedProjects.reduce((sum: number, p: any) => {
    const pending = p.applications?.filter((a: any) => a.status === 'PENDING') || [];
    return sum + pending.length;
  }, 0);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold">
        Đang tải thông tin dự án...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Overview Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" /> Tổng Quan Dự Án Bạn Quản Lý
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Dự Án Đang Sở Hữu ({totalProjects})
          </h2>
          <p className="text-slate-500 text-xs mt-1 max-w-xl">
            Xem tóm tắt các dự án bạn làm PM. Để phân quyền, phê duyệt ứng viên hoặc tăng ngân sách chuyên sâu, hãy mở trang quản trị chính.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="neutral-outline"
            className="rounded-2xl text-xs font-bold px-4 py-2.5 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tạo Job Mới
          </Button>

          <Button
            onClick={() => navigate('/manage-jobs')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            Mở Trang Quản Lý Job (PM) <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 4 Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Dự Án
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-slate-900 dark:text-white">
            {totalProjects}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Tổng Ngân Sách
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            ${totalBudget.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-500" /> Thành Viên
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-slate-900 dark:text-white">
            {totalMembers}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Đơn Chờ Duyệt
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-amber-600 dark:text-amber-400">
            {totalPendingApps}
          </div>
        </div>
      </div>

      {/* Projects List Overview */}
      {ownedProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Bạn chưa có dự án nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khởi tạo dự án đầu tiên để xây dựng đội ngũ và phát triển công việc.
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-5 py-2.5"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Tạo Dự Án Ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ownedProjects.map((project: any) => {
            const memberCount = project.members?.length || 0;
            const maxCount = project.maxMembers || 5;
            const pendingApps = project.applications?.filter((a: any) => a.status === 'PENDING') || [];

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      {project.type === 'PUBLIC' ? <Globe className="w-3 h-3 text-blue-500" /> : <Lock className="w-3 h-3 text-purple-500" />}
                      {project.type}
                    </span>
                    <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                      ${Number(project.budget || 0).toLocaleString()} {project.currency || 'USD'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                    <span>Đội ngũ: <strong>{memberCount}/{maxCount}</strong></span>
                    <span>Ứng viên: <strong>{project.applications?.length || 0}</strong></span>
                    {pendingApps.length > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        ({pendingApps.length} chờ duyệt)
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {project.tasks?.length || 0} nhiệm vụ
                  </span>
                  <Button
                    onClick={() => navigate(`/manage-jobs/${project.id}`)}
                    className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    Quản Trị Chi Tiết <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
      />
    </div>
  );
};
