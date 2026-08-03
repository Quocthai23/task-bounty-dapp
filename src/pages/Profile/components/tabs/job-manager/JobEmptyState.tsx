import React from 'react';
import { Button } from '@/components/shared/atoms/button';
import { Plus, Briefcase } from 'lucide-react';

interface JobEmptyStateProps {
  setIsCreateModalOpen: (open: boolean) => void;
}

export const JobEmptyState: React.FC<JobEmptyStateProps> = ({ 
  setIsCreateModalOpen,
}) => {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center animate-in fade-in duration-300 py-20">
      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Briefcase size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Chưa Có Dự Án Nào</h2>
      <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
        Bạn chưa tạo dự án nào. Hãy bắt đầu xây dựng đội ngũ và tìm kiếm nhân tài hàng đầu trên TaskBounty bằng cách tạo dự án đầu tiên!
      </p>

      <Button 
        size="lg" 
        onClick={() => setIsCreateModalOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold !h-auto px-10 py-4 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 mx-auto transition-transform hover:scale-105"
      >
        <Plus size={22} /> Khởi Tạo Job / Dự Án Mới
      </Button>
    </div>
  );
};
