import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Button } from '@/components/shared/atoms/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Lock,
  Tag,
  Coins
} from 'lucide-react';

interface JobCardProps {
  job: any;
  onClick: () => void;
  isJoined?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, isJoined }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isJoined) {
      navigate('/dashboard');
    } else {
      onClick();
    }
  };

  // Parse skills safely
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
    skills = ['Full Stack', 'Web3'];
  }

  const budget = Number(job.budget || 0);
  const budgetUsd = (budget / 25450).toFixed(1);
  const totalPositions = Number(job.positions || 1);
  const filledPositions = Math.min(1, totalPositions);
  const fillPercentage = Math.round((filledPositions / totalPositions) * 100);

  const isEscrowed = job.isEscrowed ?? true;
  const isUrgent = job.priority === 'High' || job.priority === 'Urgent';

  const dateLocale = i18n.language === 'vi' ? vi : enUS;

  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: dateLocale });
  } catch {
    timeAgo = t('jobs.recently');
  }

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between gap-4"
    >
      {/* Top Accent Gradient Bar on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header Row: Company + Status + Bounty Reward */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Company & Meta */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 border border-blue-200/60 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm shrink-0 shadow-xs">
            {job.companyName ? job.companyName.charAt(0).toUpperCase() : <Building2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {job.companyName || t('jobs.defaultClient')}
              </span>
              <span title={t('jobs.verifiedClient')}>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo}
              </span>
              <span>•</span>
              <span className="text-slate-500 font-medium">
                {job.type === 'PUBLIC' ? `🌐 ${t('jobs.publicJob')}` : `🔒 ${t('jobs.privateJob')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Bounty Value Highlight */}
        <div className="sm:text-right bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 px-3.5 py-2 rounded-2xl self-start sm:self-auto flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <Coins className="w-3 h-3" /> {t('jobs.bountyReward')}
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {budget.toLocaleString()} <span className="text-xs font-sans font-bold">₫</span>
          </div>
          <div className="text-[10px] font-semibold text-emerald-700/60 dark:text-emerald-400/60 font-mono hidden sm:block">
            {t('jobs.approxUsd', { amount: budgetUsd })}
          </div>
        </div>
      </div>

      {/* Main Content: Title + Description */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Priority Badge */}
          {isUrgent ? (
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-500" /> {t('jobs.urgentHiring')}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              {job.priority || t('jobs.standardHiring')}
            </span>
          )}

          {/* Escrow Status Badge */}
          {isEscrowed ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> {t('jobs.escrowSmartContract')}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <Lock className="w-3 h-3" /> {t('jobs.escrowSecured')}
            </span>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {job.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mt-2">
          {job.description || t('jobs.noDescription')}
        </p>
      </div>

      {/* Skills Badges */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {skills.slice(0, 5).map((skill, idx) => (
          <span 
            key={idx}
            className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            <Tag className="w-2.5 h-2.5 opacity-60" />
            {skill}
          </span>
        ))}
        {skills.length > 5 && (
          <span className="text-[11px] font-bold px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-400">
            +{skills.length - 5}
          </span>
        )}
      </div>

      {/* Bottom Footer: Positions Progress + Action Button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto">
        {/* Slots & Deadline */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {t('jobs.slotsMembers', { filled: filledPositions, total: totalPositions })}
            </span>
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${Math.max(20, fillPercentage)}%` }}
              />
            </div>
          </div>

          {job.deadline && (
            <div className="hidden md:flex items-center gap-1 text-slate-400">
              <span>•</span>
              <span>{t('jobs.deadline', { date: format(new Date(job.deadline), 'dd/MM/yyyy') })}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleActionClick}
          className={`h-9 px-5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-end sm:self-auto cursor-pointer ${
            isJoined 
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 group-hover:scale-102'
          }`}
        >
          <span>{isJoined ? t('jobs.enterWorkspace') : t('jobs.viewDetail')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
export default JobCard;

