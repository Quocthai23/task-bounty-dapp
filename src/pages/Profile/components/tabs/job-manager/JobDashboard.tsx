import React from 'react';
import { Button } from '@/components/shared/atoms/button';
import { Plus, ChevronRight, Users, DollarSign, ShieldCheck } from 'lucide-react';

interface JobDashboardProps {
  jobs: any[];
  setSelectedJob: (job: any) => void;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const JobDashboard: React.FC<JobDashboardProps> = ({ 
  jobs, 
  setSelectedJob, 
  setIsCreateModalOpen, 
}) => {
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Dự Án Đang Quản Lý</h2>
          <p className="text-xs text-slate-500 mt-1">Danh sách các dự án bạn là PM / Chủ sở hữu</p>
        </div>
        <Button 
          size="lg" 
          onClick={() => setIsCreateModalOpen(true)} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold rounded-2xl flex items-center gap-2 px-6 shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} /> Tạo Job Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job: any) => (
          <div 
            key={job.id} 
            onClick={() => setSelectedJob(job)}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1 pr-4">{job.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                job.type === 'PUBLIC' 
                  ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300' 
                  : 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
              }`}>
                {job.type}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 font-semibold mb-0.5 text-[10px] uppercase">Ngân sách</p>
                <p className="font-black text-emerald-600 font-mono truncate">${Number(job.budget || 0).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 font-semibold mb-0.5 text-[10px] uppercase">Ứng viên</p>
                <p className="font-bold text-slate-900 dark:text-white">{job.applications?.length || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 font-semibold mb-0.5 text-[10px] uppercase">Thành viên</p>
                <p className="font-bold text-slate-900 dark:text-white">{job.members?.length || 1}/{job.maxMembers || job.positions || 5}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Xem chi tiết quản trị</span>
              <ChevronRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
