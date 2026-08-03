import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface JobDetailViewProps {
  job: any;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ job }) => {
  const isEscrowed = job.isEscrowed ?? true;
  const budget = Number(job.budget || 0);
  const budgetUsd = (budget / 25450).toFixed(2);

  // Parse skills
  let skills: string[] = [];
  if (job.skillsRequired) {
    try {
      skills = typeof job.skillsRequired === 'string' 
        ? JSON.parse(job.skillsRequired) 
        : job.skillsRequired;
    } catch {
      skills = [job.skillsRequired];
    }
  }
  if (!Array.isArray(skills) || skills.length === 0) {
    skills = ['Reactjs', 'Nodejs', 'Web3'];
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết nhiệm vụ vào clipboard!');
    }
  };

  const handleApply = () => {
    toast.success('Đã gửi yêu cầu ứng tuyển nhiệm vụ thành công! PM sẽ liên hệ với bạn.');
  };

  let formattedDate = 'Gần đây';
  try {
    formattedDate = format(new Date(job.createdAt), 'dd MMMM, yyyy', { locale: vi });
  } catch {
    formattedDate = 'Gần đây';
  }

  return (
    <div className="h-full flex flex-col font-sans text-slate-900 bg-white dark:bg-slate-900 dark:text-white">
      {/* Sticky Sheet Header */}
      <SheetHeader className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0 sticky top-0 z-20 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${job.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <SheetTitle className="text-base font-black text-slate-900 dark:text-white">
            {job.status === 'OPEN' ? '🟢 Đang Mở Tuyển (Open)' : job.status === 'IN_PROGRESS' ? '⏳ Đang Thực Hiện' : '🔒 Đã Đóng'}
          </SheetTitle>
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Chia sẻ nhiệm vụ"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </SheetHeader>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
        
        {/* Title & Metadata */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              {job.type === 'PUBLIC' ? '🌐 Bounty Công Khai' : '🔒 Nhiệm Vụ Kín'}
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Độ ưu tiên: {job.priority || 'Tiêu chuẩn'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mt-3">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-blue-600" />
              {job.companyName || 'TaskBounty Client'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Ngày đăng: {formattedDate}
            </span>
          </div>
        </div>

        {/* Bounty & Escrow Guarantee Highlight Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 p-6 sm:p-7 rounded-3xl border border-emerald-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute -right-8 -top-8 text-emerald-500/10 pointer-events-none">
            <ShieldCheck size={180} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" /> Phần Thưởng Nhiệm Vụ (Bounty)
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {budget.toLocaleString()} <span className="text-xl font-sans font-bold">₫ VND</span>
                </p>
                <p className="text-xs font-bold text-emerald-700/70 dark:text-emerald-300/70 font-mono">
                  ≈ ${budgetUsd} USD
                </p>
              </div>
            </div>

            <div className="md:text-right">
              {isEscrowed ? (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-emerald-500/30 p-4 rounded-2xl inline-flex flex-col items-start md:items-end gap-1.5 shadow-xs">
                  <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-black text-xs">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Đã Ký Quỹ Smart Contract An Toàn
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Bảo đảm 100% giải ngân tự động khi duyệt task
                  </span>
                </div>
              ) : (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-amber-500/30 p-4 rounded-2xl inline-flex flex-col items-start md:items-end gap-1.5">
                  <span className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                    <Unlock size={16} />
                    Chưa ký quỹ bảo đảm
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-5 pt-3 border-t border-emerald-500/20 text-xs font-bold text-emerald-800/80 dark:text-emerald-300/80 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Cơ chế: Tiền thưởng sẽ được chuyển tự động vào Ví của bạn ngay sau khi hoàn thành nhiệm vụ.</span>
          </div>
        </div>

        {/* Detailed Overview Markdown */}
        <div>
          <h3 className="text-base font-black mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
            <CircleDashed size={18} className="text-blue-600" /> Mô Tả Chi Tiết & Yêu Cầu
          </h3>
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
            <ReactMarkdown>{job.description || 'Chưa có mô tả chi tiết.'}</ReactMarkdown>
          </div>
        </div>

        {/* Required Skills & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Required Skills */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-3">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-500" /> Kỹ Năng Yêu Cầu
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s: string) => (
                <span key={s} className="px-3 py-1.5 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-2xs">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl flex flex-col justify-center space-y-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Thời Hạn Hoàn Thành
            </p>
            <p className="text-base font-black text-slate-800 dark:text-slate-200">
              {job.deadline ? format(new Date(job.deadline), 'dd MMMM, yyyy', { locale: vi }) : 'Linh hoạt'}
            </p>
          </div>
        </div>

        {/* Recruitment Slots */}
        <div className="p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-800/40 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Số Lượng Thành Viên Tuyển</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {job.positions || 1} Vị trí
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

      </div>

      {/* Sticky Bottom Apply Bar */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0 sticky bottom-0 z-20 flex gap-4">
        <Button
          onClick={handleApply}
          className="flex-1 h-13 rounded-2xl text-sm font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-101 cursor-pointer"
        >
          Ứng Tuyển Nhiệm Vụ (Apply Now) 🚀
        </Button>
      </div>
    </div>
  );
};
export default JobDetailView;
