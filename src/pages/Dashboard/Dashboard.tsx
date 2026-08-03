import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectService } from '@/services/project.service';
import { userService } from '@/services/user.service';
import { metadataService } from '@/services/metadata.service';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Coins, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  PlusCircle, 
  X,
  Briefcase,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { JobCard } from '@/components/features/jobs/JobCard';
import { JobFilter } from '@/components/features/jobs/JobFilter';
import { JobDetailView } from '@/components/features/jobs/JobDetailView';
import { Sheet, SheetContent } from '@/components/shared/atoms/sheet';
import { Button } from '@/components/shared/atoms/button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: userService.getMe,
  });

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects()
  });

  const { data: skillsData } = useQuery({
    queryKey: ['metadata-skills'],
    queryFn: () => metadataService.getSkills()
  });

  const { data: positionsData } = useQuery({
    queryKey: ['metadata-positions'],
    queryFn: () => metadataService.getPositions()
  });

  const { data: budgetRangesData } = useQuery({
    queryKey: ['metadata-budget-ranges'],
    queryFn: () => metadataService.getBudgetRanges()
  });

  const [selectedJob, setSelectedJob] = useState<any>(null);

  const dynamicCategories = useMemo(() => {
    const list = [{ label: t('dashboard.allCategories'), value: '' }];
    if (Array.isArray(positionsData)) {
      positionsData.forEach(pos => {
        let icon = '⚡';
        const lower = pos.toLowerCase();
        if (lower.includes('front')) icon = '💻';
        else if (lower.includes('back')) icon = '⚙️';
        else if (lower.includes('full')) icon = '🚀';
        else if (lower.includes('contract') || lower.includes('solidity')) icon = '⛓️';
        else if (lower.includes('design') || lower.includes('ui')) icon = '🎨';
        else if (lower.includes('defi')) icon = '🪙';
        else if (lower.includes('mobile')) icon = '📱';
        else if (lower.includes('qa') || lower.includes('test')) icon = '🧪';
        else if (lower.includes('devops')) icon = '☁️';
        else if (lower.includes('manager') || lower.includes('pm')) icon = '📋';
        list.push({ label: `${icon} ${pos}`, value: pos });
      });
    }
    return list;
  }, [positionsData, t]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [escrowOnly, setEscrowOnly] = useState(false);
  const [sortOption, setSortOption] = useState<'latest' | 'oldest' | 'price-desc' | 'price-asc'>('latest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const publicJobs = useMemo(() => {
    let jobs = (projectsData as any)?.data?.filter((p: any) => p.type === 'PUBLIC') || [];

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      jobs = jobs.filter((j: any) => 
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.companyName?.toLowerCase().includes(q) ||
        (j.skillsRequired && j.skillsRequired.toLowerCase().includes(q))
      );
    }

    // Position filter
    if (selectedPosition) {
      jobs = jobs.filter((j: any) => 
        j.title?.toLowerCase().includes(selectedPosition.toLowerCase()) || 
        j.description?.toLowerCase().includes(selectedPosition.toLowerCase())
      );
    }

    // Price range
    if (minPrice) {
      jobs = jobs.filter((j: any) => Number(j.budget || 0) >= parseInt(minPrice));
    }
    if (maxPrice) {
      jobs = jobs.filter((j: any) => Number(j.budget || 0) <= parseInt(maxPrice));
    }

    // Escrow filter
    if (escrowOnly) {
      jobs = jobs.filter((j: any) => j.isEscrowed === true);
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      jobs = jobs.filter((j: any) => {
        if (!j.skillsRequired) return false;
        try {
          const jobSkills = typeof j.skillsRequired === 'string'
            ? JSON.parse(j.skillsRequired)
            : j.skillsRequired;
          return selectedSkills.some(skill => 
            Array.isArray(jobSkills) && jobSkills.some((s: string) => s.toLowerCase() === skill.toLowerCase())
          );
        } catch {
          return false;
        }
      });
    }

    // Sorting
    jobs.sort((a: any, b: any) => {
      if (sortOption === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOption === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOption === 'price-desc') return Number(b.budget || 0) - Number(a.budget || 0);
      if (sortOption === 'price-asc') return Number(a.budget || 0) - Number(b.budget || 0);
      return 0;
    });

    return jobs;
  }, [projectsData, searchTerm, selectedPosition, minPrice, maxPrice, selectedSkills, escrowOnly, sortOption]);

  const handleSelectJob = (job: any) => {
    setSelectedJob(job);
  };

  const userName = (user as any)?.firstName 
    ? `${(user as any)?.firstName} ${(user as any)?.lastName || ''}`.trim() 
    : (user as any)?.username || 'TaskBounty User';

  const sortOptions = [
    { value: 'latest', label: t('dashboard.sortLatest') },
    { value: 'price-desc', label: t('dashboard.sortPriceDesc') },
    { value: 'price-asc', label: t('dashboard.sortPriceAsc') },
    { value: 'oldest', label: t('dashboard.sortOldest') },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortOption)?.label;

  return (
    <>
      <div className="w-full min-h-full flex flex-col font-sans space-y-6 pb-12">
        
        {/* ========================================================================= */}
        {/* COMPACT HERO BANNER & QUICK STATS                                         */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-2xl p-4 sm:p-5 text-white shadow-md shadow-blue-500/10 shrink-0">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                {t('dashboard.welcomeBack')} {userName} <span className="animate-bounce">👋</span>
              </h1>
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-blue-100 bg-white/15 px-3 py-1 rounded-full border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('dashboard.smartContract100')}</span>
              </div>
              <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-bold text-blue-100 bg-white/15 px-3 py-1 rounded-full border border-white/20">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('dashboard.payOsInstant')}</span>
              </div>
            </div>

            {/* Quick Action Button - Fixed High Contrast */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                onClick={() => navigate('/manage-jobs')}
                className="bg-white hover:bg-blue-50 text-blue-700 font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-blue-700" />
                <span>{t('dashboard.postBountyBtn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN DISCOVER WORKSPACE (SEARCH + CATEGORIES + CARDS + SIDEBAR)           */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6">
          
          {/* Top Search & Filter Toolbar */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('dashboard.searchPlaceholder')}
                  className="w-full pl-11 pr-10 py-3 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-slate-800 dark:text-slate-200"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Toolbar Controls: Sort, View Mode, Mobile Filter Trigger */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>{currentSortLabel}</span>
                    <ChevronDown size={14} className="text-slate-400 ml-1" />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-30 py-2 animate-in fade-in zoom-in-95">
                      {sortOptions.map(opt => (
                        <button 
                          key={opt.value}
                          onClick={() => { setSortOption(opt.value as any); setIsSortOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                            sortOption === opt.value 
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {sortOption === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title={t('dashboard.viewGrid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title={t('dashboard.viewList')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className="xl:hidden flex items-center gap-1.5 px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{t('dashboard.filterBtn')}</span>
                </button>
              </div>
            </div>

            {/* Quick Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              {dynamicCategories.map(cat => {
                const isSelected = selectedPosition === cat.value;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedPosition(cat.value)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body: Left Content Area + Right Filter Sidebar */}
          <div className="flex gap-8 items-start">
            
            {/* Left: Job Cards Stream */}
            <div className="flex-1 min-w-0">
              {isLoadingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 animate-pulse space-y-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
                      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md w-full" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
                    </div>
                  ))}
                </div>
              ) : publicJobs.length === 0 ? (
                <div className="text-center py-16 px-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-600">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {t('dashboard.emptyTitle')}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {t('dashboard.emptyDesc')}
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPosition('');
                      setSelectedSkills([]);
                      setMinPrice('');
                      setMaxPrice('');
                      setEscrowOnly(false);
                    }}
                    variant="neutral-outline"
                    className="mt-2 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {t('dashboard.resetAllFilters')}
                  </Button>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
                    : 'flex flex-col space-y-4'
                }>
                  {publicJobs.map((job: any) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onClick={() => handleSelectJob(job)} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Sticky Filter Sidebar (Desktop) */}
            <div className="hidden xl:block w-88 shrink-0 sticky top-4">
              <JobFilter 
                positions={positionsData || []}
                skills={skillsData || []}
                selectedPosition={selectedPosition}
                setSelectedPosition={setSelectedPosition}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                escrowOnly={escrowOnly}
                setEscrowOnly={setEscrowOnly}
                budgetPresets={budgetRangesData?.presets}
                budgetMax={budgetRangesData?.max}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end xl:hidden">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm">{t('filter.filterTitle')}</h3>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <JobFilter 
              positions={positionsData || []}
              skills={skillsData || []}
              selectedPosition={selectedPosition}
              setSelectedPosition={setSelectedPosition}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              escrowOnly={escrowOnly}
              setEscrowOnly={setEscrowOnly}
              budgetPresets={budgetRangesData?.presets}
              budgetMax={budgetRangesData?.max}
            />
            <Button 
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-blue-600 text-white rounded-xl text-xs font-bold py-3 cursor-pointer"
            >
              {t('dashboard.applyFilter')}
            </Button>
          </div>
        </div>
      )}

      {/* Job Detail View Sheet */}
      <Sheet open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <SheetContent side="right" className="w-[850px] sm:max-w-none p-0 bg-neutral-50 overflow-y-auto custom-scrollbar border-l border-neutral-200">
          {selectedJob && <JobDetailView job={selectedJob} />}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Dashboard;
