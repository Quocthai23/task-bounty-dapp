import React, { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { Button } from '@/components/shared/atoms/button';
import { 
  CheckCircle2, 
  X, 
  Sparkles, 
  Users, 
  Gift, 
  Coins, 
  AlertTriangle,
  Award,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface CompleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  tasks?: any[];
  onSuccess?: () => void;
}

export const CompleteProjectModal: React.FC<CompleteProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  tasks = [],
  onSuccess
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const totalBudget = project?.budget || 0;
  const currency = project?.currency || 'VND';

  // Calculate total paid / done tasks
  const paidTaskBudget = useMemo(() => {
    return tasks
      .filter((t: any) => t.status === 'DONE')
      .reduce((sum: number, t: any) => sum + (Number(t.budget) || 0), 0);
  }, [tasks]);

  const surplusBudget = Math.max(0, totalBudget - paidTaskBudget);

  // Eligible members: exclude PM and Owner
  const eligibleMembers = useMemo(() => {
    if (!project?.members) return [];
    return project.members.filter(
      (m: any) => m.role !== 'PM' && m.userId !== project.ownerId
    );
  }, [project]);

  const sharePerMember = useMemo(() => {
    if (eligibleMembers.length === 0 || surplusBudget <= 0) return 0;
    return Math.floor((surplusBudget / eligibleMembers.length) * 100) / 100;
  }, [surplusBudget, eligibleMembers]);

  // Mutation
  const completeMutation = useMutation({
    mutationFn: () => projectService.completeProject(project.id),
    onSuccess: (data: any) => {
      toast.success(
        data?.message || '🎉 Chúc mừng! Dự án đã được nghiệm thu hoàn thành và chia đều quỹ thặng dư!',
        { duration: 5000 }
      );
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects-owned'] });
      queryClient.invalidateQueries({ queryKey: ['projects-joined'] });
      queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể hoàn thành dự án');
    }
  });

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Nghiệm Thu & Hoàn Thành Dự Án
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {project.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white mb-1">
              Cam kết giải ngân 100% quỹ bảo chứng Escrow
            </p>
            <p>
              Toàn bộ số dư ngân sách còn lại sau khi trừ các nhiệm vụ hoàn thành sẽ được <b>chia đều tự động</b> cho tất cả thành viên trong đội ngũ (ngoại trừ PM và Chủ dự án).
            </p>
          </div>
        </div>

        {/* Calculation Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-slate-500 dark:text-slate-400">Tổng quỹ bảo chứng</span>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {totalBudget.toLocaleString()} {currency}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-slate-500 dark:text-slate-400">Đã trả qua các task</span>
            <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {paidTaskBudget.toLocaleString()} {currency}
            </p>
          </div>
          <div className="col-span-2 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                <Gift className="w-4 h-4" /> Quỹ thặng dư phân phối (Surplus)
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chia đều cho {eligibleMembers.length} thành viên
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                +{surplusBudget.toLocaleString()} {currency}
              </p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ≈ +{sharePerMember.toLocaleString()} {currency} / người
              </p>
            </div>
          </div>
        </div>

        {/* Eligible Members Preview */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-500" /> Danh sách thành viên nhận thưởng (+{eligibleMembers.length})
          </h4>
          {eligibleMembers.length === 0 ? (
            <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              Dự án chưa có thành viên nào khác ngoài PM.
            </div>
          ) : (
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {eligibleMembers.map((m: any) => (
                <div 
                  key={m.id || m.userId}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                      {(m.user?.firstName || m.user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ''}`.trim() : m.user?.email}
                      </span>
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        {m.role || 'DEV'}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{sharePerMember.toLocaleString()} {currency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning Note */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Hành động này sẽ chuyển trạng thái dự án sang <b>COMPLETED</b> và tiến hành chuyển token thưởng vào ví các thành viên ngay lập tức.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
          >
            Đóng
          </Button>
          <Button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {completeMutation.isPending ? 'Đang hoàn tất...' : 'Xác Nhận Nghiệm Thu & Chia Thưởng'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompleteProjectModal;
