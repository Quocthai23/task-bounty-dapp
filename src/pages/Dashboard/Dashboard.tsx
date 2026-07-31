import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { userService } from '@/services/user.service';
import { metadataService } from '@/services/metadata.service';
import { ChevronDown } from 'lucide-react';
import { JobCard } from '@/components/features/jobs/JobCard';
import { JobFilter } from '@/components/features/jobs/JobFilter';
import { JobDetailView } from '@/components/features/jobs/JobDetailView';
import { Sheet, SheetContent } from '@/components/shared/atoms/sheet';

export const Dashboard: React.FC = () => {
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

  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Filters State
  const [selectedPosition, setSelectedPosition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'latest' | 'oldest' | 'price-desc' | 'price-asc'>('latest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const publicJobs = useMemo(() => {
    let jobs = (projectsData as any)?.data?.filter((p: any) => p.type === 'PUBLIC') || [];

    if (selectedPosition) {
      jobs = jobs.filter((j: any) => 
        j.title.toLowerCase().includes(selectedPosition.toLowerCase()) || 
        j.description.toLowerCase().includes(selectedPosition.toLowerCase())
      );
    }

    if (minPrice) {
      jobs = jobs.filter((j: any) => j.budget >= parseInt(minPrice));
    }
    if (maxPrice) {
      jobs = jobs.filter((j: any) => j.budget <= parseInt(maxPrice));
    }

    if (selectedSkills.length > 0) {
      jobs = jobs.filter((j: any) => {
        if (!j.skillsRequired) return false;
        try {
          const jobSkills = JSON.parse(j.skillsRequired);
          return selectedSkills.some(skill => jobSkills.includes(skill));
        } catch(e) {
          return false;
        }
      });
    }

    jobs.sort((a: any, b: any) => {
      if (sortOption === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOption === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOption === 'price-desc') return b.budget - a.budget;
      if (sortOption === 'price-asc') return a.budget - b.budget;
      return 0;
    });

    return jobs;
  }, [projectsData, selectedPosition, minPrice, maxPrice, selectedSkills, sortOption]);

  const handleSelectJob = (job: any) => {
    setSelectedJob(job);
  };

  const userName = (user as any)?.firstName || (user as any)?.username || 'User';

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'price-asc', label: 'Price: Low to High' },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortOption)?.label;

  return (
    <>
      <div className="h-full flex flex-col font-sans">
        <div className="flex items-center gap-3 mb-6 shrink-0 px-2">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
            Welcome back, {userName}
          </h1>
          <span className="text-3xl md:text-4xl animate-bounce origin-bottom-right">👋</span>
          
          <div className="ml-auto hidden lg:flex items-center gap-4">
             <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 rounded-full border-2 border-neutral-50" />
                <img src="https://i.pravatar.cc/100?img=2" className="w-10 h-10 rounded-full border-2 border-neutral-50" />
                <img src="https://i.pravatar.cc/100?img=3" className="w-10 h-10 rounded-full border-2 border-neutral-50" />
                <img src="https://i.pravatar.cc/100?img=4" className="w-10 h-10 rounded-full border-2 border-neutral-50" />
                <div className="w-10 h-10 rounded-full border-2 border-neutral-50 bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">+14</div>
             </div>
             <button className="h-10 px-4 flex items-center gap-2 border border-primary-500 text-primary-500 font-bold rounded-full hover:bg-blue-50 transition-colors bg-white">
               + Invite
             </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-neutral-100 p-6 md:p-8 flex gap-8 min-h-0 overflow-hidden">
          
          <div className="flex-1 flex flex-col min-h-0">
            <div className="mb-6 relative">
               <button 
                 onClick={() => setIsSortOpen(!isSortOpen)}
                 className="flex items-center justify-between min-w-[160px] px-5 py-2.5 bg-white border border-primary-500 text-neutral-800 rounded-full font-semibold hover:bg-neutral-50 shadow-sm transition-colors"
               >
                  {currentSortLabel} <ChevronDown size={16} className="text-primary-500 ml-2" />
               </button>
               {isSortOpen && (
                 <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-neutral-100 rounded-xl shadow-lg z-20 py-2">
                   {sortOptions.map(opt => (
                     <button 
                       key={opt.value}
                       onClick={() => { setSortOption(opt.value as any); setIsSortOpen(false); }}
                       className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 ${sortOption === opt.value ? 'text-primary-500 font-bold' : 'text-neutral-700'}`}
                     >
                       {opt.label}
                     </button>
                   ))}
                 </div>
               )}
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar pb-10">
              {isLoadingProjects ? (
                <div className="text-center py-12 font-medium text-neutral-500 animate-pulse">Loading jobs...</div>
              ) : publicJobs.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 font-medium bg-neutral-50 rounded-2xl">No public jobs match your filters.</div>
              ) : (
                publicJobs.map((job: any) => (
                  <JobCard key={job.id} job={job} onClick={() => handleSelectJob(job)} />
                ))
              )}
            </div>
          </div>

          <div className="hidden xl:block w-96 shrink-0 border-l border-neutral-100 pl-8 overflow-y-auto custom-scrollbar">
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
            />
          </div>

        </div>
      </div>

      <Sheet open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <SheetContent side="right" className="w-[800px] sm:max-w-none p-0 bg-neutral-50 overflow-y-auto custom-scrollbar border-l border-neutral-200">
          {selectedJob && <JobDetailView job={selectedJob} />}
        </SheetContent>
      </Sheet>
    </>
  );
};
