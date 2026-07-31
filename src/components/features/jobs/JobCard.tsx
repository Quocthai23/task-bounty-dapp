import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/shared/atoms/button';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: any;
  onClick: () => void;
  isJoined?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, isJoined }) => {
  const navigate = useNavigate();

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isJoined) {
      navigate('/dashboard'); // Navigate to workspace
    } else {
      // apply logic could go here or trigger a modal
    }
  };

  return (
    <div 
      className="p-6 bg-white border border-neutral-200 rounded-3xl hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 shrink-0 rounded-full border-2 border-primary-500"></div>
          <h3 className="text-xl font-extrabold text-neutral-900 group-hover:text-primary-500 transition-colors line-clamp-1">{job.title}</h3>
        </div>
        <div className="text-lg font-bold text-primary-500 shrink-0 ml-4">
          {job.budget.toLocaleString()} VND
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 flex flex-col justify-between">
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-4">
            {job.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500 mt-auto">
            <span>Company: <span className="text-primary-500">{job.companyName || 'TaskBounty'}</span></span>
            <span>Priority: <span className="text-primary-500">{job.priority || 'Moderate'}</span></span>
            <span>Status: <span className="text-red-500">{job.status}</span></span>
            <span className="text-neutral-400 font-medium whitespace-nowrap">Created: {format(new Date(job.createdAt), 'dd/MM/yyyy')}</span>
          </div>
        </div>
        
        <div className="w-32 shrink-0 flex flex-col items-center justify-between">
          <div className="w-full aspect-[4/3] rounded-xl bg-neutral-100 overflow-hidden shadow-sm">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80" className="w-full h-full object-cover" alt="Job thumbnail" />
          </div>
          <div className="w-full flex items-center justify-between mt-3">
            <Button 
              onClick={handleActionClick}
              variant={isJoined ? "outline" : "primary-contained"} 
              className={`h-8 px-4 rounded-full text-xs font-bold ${isJoined ? 'border-primary-500 text-primary-500 hover:bg-primary-50' : 'shadow-md shadow-primary-500/20 bg-primary-500 hover:bg-blue-600 border-none text-white'}`}
            >
              {isJoined ? 'View' : 'Apply'}
            </Button>
            <span className="text-[10px] font-bold text-neutral-500 whitespace-nowrap">1/{job.positions || 2} Mem</span>
          </div>
        </div>
      </div>
    </div>
  );
};
