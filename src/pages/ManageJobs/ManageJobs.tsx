import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectService } from '@/services/project.service';
import { Button } from '@/components/shared/atoms/button';
import { CreateProjectModal } from '@/components/features/manage-jobs/CreateProjectModal';
import { 
  Briefcase, 
  Plus, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  ArrowRight, 
  Lock, 
  Globe, 
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const ManageJobs: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'RECRUITING' | 'FULL'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: ownedProjects = [], isLoading } = useQuery({
    queryKey: ['owned-projects'],
    queryFn: () => projectService.getOwnedProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owned-projects'] });
    },
  });

  // Calculate PM metrics
  const totalProjects = ownedProjects.length;
  const totalBudgetEscrow = ownedProjects.reduce((sum: number, p: any) => sum + (Number(p.budget) || 0), 0);
  const totalMembers = ownedProjects.reduce((sum: number, p: any) => sum + (p.members?.length || 0), 0);
  const totalPendingApplications = ownedProjects.reduce((sum: number, p: any) => {
    const pending = p.applications?.filter((a: any) => a.status === 'PENDING') || [];
    return sum + pending.length;
  }, 0);

  const filteredProjects = ownedProjects.filter((p: any) => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    const currentCount = p.members?.length || 0;
    const maxCount = p.maxMembers || 5;

    if (filterTab === 'RECRUITING') {
      return p.isRecruiting && currentCount < maxCount;
    }
    if (filterTab === 'FULL') {
      return currentCount >= maxCount || !p.isRecruiting;
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Clean White Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              <ShieldCheck className="w-4 h-4" /> {t('manageJobs.commandCenter')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('manageJobs.title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mt-1.5 leading-relaxed">
              {t('manageJobs.subtitle')}
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 shrink-0 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> {t('manageJobs.createNewJobBtn')}
          </Button>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {t('manageJobs.statManagedProjects')}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-slate-900 dark:text-white">
              {totalProjects}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {t('manageJobs.statEscrowBudget')}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-emerald-600 dark:text-emerald-400">
              ${totalBudgetEscrow.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {t('manageJobs.statTotalMembers')}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-purple-600 dark:text-purple-400">
              {totalMembers}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 relative overflow-hidden">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {t('manageJobs.statPendingApps')}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-amber-600 dark:text-amber-400 flex items-center gap-2">
              {totalPendingApplications}
              {totalPendingApplications > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('manageJobs.tabAll', { count: totalProjects })}
          </button>
          <button
            onClick={() => setFilterTab('RECRUITING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'RECRUITING'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('manageJobs.tabRecruiting')}
          </button>
          <button
            onClick={() => setFilterTab('FULL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'FULL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('manageJobs.tabFull')}
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('manageJobs.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white shadow-sm"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('manageJobs.emptyTitle')}</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            {t('manageJobs.emptyDesc')}
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs px-5 py-2.5"
          >
            <Plus className="w-4 h-4 mr-1.5" /> {t('manageJobs.emptyCreateBtn')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => {
            const memberCount = project.members?.length || 0;
            const maxCount = project.maxMembers || 5;
            const pendingApps = project.applications?.filter((a: any) => a.status === 'PENDING') || [];
            const hasApplicants = (project.applications?.length || 0) > 0;
            const percentFilled = Math.min(100, Math.round((memberCount / maxCount) * 100));

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                      project.type === 'PUBLIC'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                    }`}>
                      {project.type === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {project.type === 'PUBLIC' ? t('manageJobs.publicCommunity') : t('manageJobs.privateInternal')}
                    </span>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      project.isRecruiting && memberCount < maxCount
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800'
                    }`}>
                      {project.isRecruiting && memberCount < maxCount ? t('manageJobs.recruitingBadge') : t('manageJobs.fullBadge')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed min-h-[32px]">
                    {project.description}
                  </p>

                  {/* Escrow Proof Card */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> {t('manageJobs.committedBudget')}
                      </div>
                      <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ${Number(project.budget || 0).toLocaleString()} <span className="text-[11px] font-sans font-bold text-slate-500">{project.currency || 'USD'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {hasApplicants ? (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {t('manageJobs.lockBudget')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                          {t('manageJobs.negotiableBudget')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {t('manageJobs.teamSize')}
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {t('manageJobs.teamCount', { count: memberCount, max: maxCount })}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>

                  {/* Pending Applications Alert */}
                  {pendingApps.length > 0 && (
                    <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        {t('manageJobs.pendingAppsAlert', { count: pendingApps.length })}
                      </span>
                      <span className="text-[11px] underline cursor-pointer hover:text-amber-950">{t('manageJobs.viewNow')}</span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {t('manageJobs.tasksCount', { count: project.tasks?.length || 0 })}
                  </span>

                  <Button
                    onClick={() => navigate(`/manage-jobs/${project.id}`)}
                    className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    {t('manageJobs.adminManageBtn')} <ArrowRight className="w-3.5 h-3.5" />
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
