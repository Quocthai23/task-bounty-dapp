import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/shared/atoms/button';
import { SheetHeader, SheetTitle } from '@/components/shared/atoms/sheet';
import ReactMarkdown from 'react-markdown';
import { CheckCircle2, CircleDashed, Lock, Unlock, Users, Building, ShieldCheck, BadgeCheck } from 'lucide-react';

interface JobDetailViewProps {
  job: any;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ job }) => {
  const isEscrowed = job.isEscrowed ?? false;

  return (
    <div className="h-full flex flex-col font-sans text-neutral-900 bg-white">
      <SheetHeader className="px-8 py-6 border-b border-neutral-100 bg-white shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full border-2 ${job.status === 'OPEN' ? 'border-green-500 bg-green-500/20' : 'border-amber-500 bg-amber-500/20'}`}></div>
          <SheetTitle className="text-xl font-black">
            {job.status === 'OPEN' ? '🟢 Open' : job.status === 'IN_PROGRESS' ? '⏳ In Progress' : '🔒 Closed'}
          </SheetTitle>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* Title & Meta */}
        <div>
          <h1 className="text-4xl font-black mb-4 leading-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-neutral-500">
            <span className="flex items-center gap-1"><Building size={16} /> {job.companyName || 'TaskBounty'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">Priority: {job.priority || 'Moderate'}</span>
            <span>•</span>
            <span>Created: {format(new Date(job.createdAt), 'dd MMM, yyyy')}</span>
          </div>
        </div>

        {/* Financial & Escrow (The Trust Factor) */}
        <div className="bg-gradient-to-br from-green-500/5 to-green-600/5 p-6 rounded-3xl border border-green-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-green-500/10 pointer-events-none">
            <ShieldCheck size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-green-700 font-bold uppercase tracking-wider mb-2">Bounty / Budget</p>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-black text-green-600">{job.budget.toLocaleString()} <span className="text-2xl font-bold">VND</span></p>
                <p className="text-sm font-bold text-green-700/60 mb-1">≈ ${(job.budget / 25000).toFixed(2)} USD</p>
              </div>
            </div>

            <div className="md:text-right">
              {isEscrowed ? (
                <div className="bg-white/60 backdrop-blur-md border border-green-500/30 p-4 rounded-2xl inline-flex flex-col items-start md:items-end gap-2">
                  <span className="flex items-center gap-2 text-green-700 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-green-600" />
                    Ngân sách đã được khóa an toàn
                  </span>
                  {job.escrowTxHash && (
                    <span className="text-xs font-mono text-green-700/60 bg-green-500/10 px-2 py-1 rounded-md">
                      Tx: {job.escrowTxHash.substring(0, 10)}...{job.escrowTxHash.substring(job.escrowTxHash.length - 8)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="bg-white/60 backdrop-blur-md border border-amber-500/30 p-4 rounded-2xl inline-flex flex-col items-start md:items-end gap-2">
                  <span className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                    <Unlock size={18} />
                    Chưa khóa ngân sách
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-green-500/20 text-xs font-bold text-green-700/70">
            💡 Cơ chế: Tiền sẽ được chuyển tự động về ví ngay khi PM duyệt (Approve) task.
          </div>
        </div>

        {/* Overview */}
        <div>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <CircleDashed size={20} className="text-primary-500" /> Overview
          </h3>
          <div className="prose prose-neutral prose-headings:font-bold prose-a:text-primary-600 max-w-none text-neutral-600 bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100">
            <ReactMarkdown>{job.description}</ReactMarkdown>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Skills */}
          <div className="p-6 bg-neutral-50 border border-neutral-100 rounded-3xl">
            <p className="text-sm text-neutral-500 font-bold mb-3 uppercase tracking-wider">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired ? JSON.parse(job.skillsRequired).map((s: string) => (
                <span key={s} className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold shadow-sm">{s}</span>
              )) : <span className="text-sm font-semibold">Any</span>}
            </div>
          </div>

          {/* Deadline */}
          <div className="p-6 bg-neutral-50 border border-neutral-100 rounded-3xl flex flex-col justify-center">
            <p className="text-sm text-neutral-500 font-bold mb-2 uppercase tracking-wider">Deadline</p>
            <p className="text-lg font-black text-neutral-800">
              {job.deadline ? format(new Date(job.deadline), 'dd MMMM, yyyy') : 'No strict deadline'}
            </p>
            <p className="text-xs font-semibold text-neutral-400 mt-1">Estimate time left: {job.deadline ? Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 3600 * 24)) : '--'} days</p>
          </div>
        </div>

        {/* Recruitment & Stats */}
        <div>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary-500" /> Recruitment Status
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 p-6 border border-neutral-200 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 font-bold">Positions Left</p>
                <p className="text-2xl font-black">{job.positions}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
                <Users size={24} className="text-primary-500" />
              </div>
            </div>
            <div className="flex-1 p-6 border border-neutral-200 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 font-bold">Applicants</p>
                <p className="text-2xl font-black">12 <span className="text-sm font-medium text-neutral-400 font-normal">waiting</span></p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <BadgeCheck size={24} className="text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* PM Profile */}
        <div>
          <h3 className="text-lg font-black mb-4">Client Profile</h3>
          <div className="p-6 border border-neutral-200 rounded-3xl flex items-center gap-6 bg-white shadow-sm">
            <div className="w-16 h-16 shrink-0 relative">
              <img src="https://i.pravatar.cc/150?u=pm" alt="PM Avatar" className="w-full h-full object-cover rounded-full border-2 border-neutral-100" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black flex items-center gap-2">
                Mirroto Tech Lead
                <BadgeCheck size={18} className="text-blue-500" />
              </h4>
              <div className="flex gap-4 mt-2 text-sm font-semibold">
                <span className="text-neutral-500">Success Rate: <span className="text-green-600 font-bold">98%</span></span>
                <span className="text-neutral-500">Total Disbursed: <span className="text-neutral-900 font-bold">500M+ VND</span></span>
              </div>
            </div>
            <Button className="h-10 px-6 rounded-xl font-bold border-neutral-200 hover:bg-neutral-50">
              View Profile
            </Button>
          </div>
        </div>

      </div>

      <div className="p-6 border-t border-neutral-100 bg-white shrink-0 sticky bottom-0 z-10 flex gap-4">
        <Button
          variant="primary-contained"
          className="flex-1 h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isEscrowed}
        >
          {isEscrowed ? 'Ứng tuyển ngay (Apply Now)' : 'Chưa thể ứng tuyển'}
        </Button>
      </div>
    </div>
  );
};
