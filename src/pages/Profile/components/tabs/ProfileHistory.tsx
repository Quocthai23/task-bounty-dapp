import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/profile.service';
import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/shared/atoms/button';

export const ProfileHistory: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Use filter key in query key to re-fetch when dates change
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['history', startDate, endDate],
    queryFn: () => profileService.getHistory(startDate, endDate)
  });

  const handleFilter = () => {
    refetch();
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
  };

  // Group logs by date
  const groupedLogs = (logs || []).reduce((acc: any, log: any) => {
    const dateStr = format(new Date(log.createdAt), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(log);
    return acc;
  }, {});

  const getRelativeDateStr = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'dd/MM/yyyy');
  };

  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 items-end bg-neutral-50 p-4 rounded-xl border border-neutral-100">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">From Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">To Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
            <Button variant="outline" onClick={handleClear} className="flex-1 md:flex-none">Clear</Button>
            <Button onClick={handleFilter} className="flex-1 md:flex-none bg-neutral-900 text-white hover:bg-neutral-800">Filter</Button>
          </div>
        </div>

        {/* Loading / Empty States */}
        {isLoading && <div className="text-center text-neutral-400 py-10 font-bold animate-pulse">Loading history...</div>}
        {!isLoading && logs?.length === 0 && (
          <div className="text-center text-neutral-400 py-10 font-bold border-2 border-dashed border-neutral-200 rounded-2xl">
            No history found.
          </div>
        )}

        {/* History List */}
        {!isLoading && Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map((dateKey) => (
          <div key={dateKey} className="border-b border-neutral-100 pb-8 last:border-0 relative">
            <div className="absolute left-[3px] top-8 bottom-0 w-0.5 bg-neutral-100"></div>
            <h4 className="text-sm font-black text-neutral-900 mb-6 bg-white inline-block relative z-10 px-2 -ml-2 rounded-lg shadow-sm border border-neutral-100">
              {getRelativeDateStr(dateKey)}
            </h4>
            <div className="space-y-6">
              {groupedLogs[dateKey].map((log: any, logIndex: number) => (
                <div key={logIndex} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary-500 ring-4 ring-white"></div>
                  <div className="text-neutral-700 font-medium">{log.action}</div>
                  <div className="text-xs text-neutral-400 font-bold mt-1">{format(new Date(log.createdAt), 'HH:mm')}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
