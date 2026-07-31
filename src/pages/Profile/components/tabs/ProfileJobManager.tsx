import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { Button } from '@/components/shared/atoms/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shared/atoms/dialog';
import { Plus, Briefcase, ChevronRight, Users, Check, X, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileJobManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  // Create Job Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', budget: '', positions: '1', skillsRequired: ''
  });

  const { data: ownedProjects, isLoading } = useQuery({
    queryKey: ['projects-owned'],
    queryFn: async () => {
      // Temporary inline extension since we don't want to break if service is missing it
      const res = await (projectService as any).getOwnedProjects?.() || [];
      return res;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-owned'] });
      setIsCreateModalOpen(false);
      setFormData({ title: '', description: '', budget: '', positions: '1', skillsRequired: '' });
      toast.success('Job Created Successfully!');
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      budget: parseFloat(formData.budget),
      positions: parseInt(formData.positions),
      skillsRequired: JSON.stringify(formData.skillsRequired.split(',').map(s => s.trim())),
      type: 'PUBLIC'
    });
  };

  if (isLoading) {
    return <div className="p-10 text-center text-neutral-400 font-medium">Loading Job Manager...</div>;
  }

  const jobs = ownedProjects || [];

  // STATE 1: No Jobs Created (Empty State)
  if (jobs.length === 0) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center animate-in fade-in duration-300 py-20">
        <div className="w-24 h-24 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase size={40} />
        </div>
        <h2 className="text-3xl font-black text-neutral-900 mb-4">No Projects Yet</h2>
        <p className="text-neutral-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
          You haven't created any jobs. Start building your team by creating a new job and finding the best talents on Task Bounty!
        </p>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-10 py-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 mx-auto">
              <Plus size={24} /> Create Your First Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-6 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Create New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Job Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500" placeholder="e.g. Frontend Developer" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500 h-24 resize-none" placeholder="Describe the job..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Budget (VND)</label>
                  <input required type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500" placeholder="e.g. 5000000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Positions</label>
                  <input required type="number" min="1" value={formData.positions} onChange={e => setFormData({...formData, positions: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Skills (comma separated)</label>
                <input required value={formData.skillsRequired} onChange={e => setFormData({...formData, skillsRequired: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500" placeholder="e.g. React, Node.js" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full py-6 bg-neutral-900 hover:bg-black text-white font-black rounded-xl mt-4">
                {createMutation.isPending ? 'Creating...' : 'Create Job'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // STATE 2: Project List Dashboard
  if (!selectedJob) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-neutral-900">PM Dashboard</h2>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl flex items-center gap-2">
            <Plus size={18} /> Create Job
          </Button>
        </div>

        {/* Modal is still needed here for Create Job */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-6 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Create New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Job Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500" placeholder="e.g. Frontend Developer" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500 h-24 resize-none" placeholder="Describe the job..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Budget (VND)</label>
                  <input required type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500" placeholder="e.g. 5000000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Positions</label>
                  <input required type="number" min="1" value={formData.positions} onChange={e => setFormData({...formData, positions: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Skills (comma separated)</label>
                <input required value={formData.skillsRequired} onChange={e => setFormData({...formData, skillsRequired: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500" placeholder="e.g. React, Node.js" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full py-6 bg-neutral-900 hover:bg-black text-white font-black rounded-xl mt-4">
                {createMutation.isPending ? 'Creating...' : 'Create Job'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job: any) => (
            <div key={job.id} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-neutral-900 line-clamp-1 pr-4">{job.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'}`}>
                  {job.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <p className="text-neutral-500 font-semibold mb-1 text-xs">Budget</p>
                  <p className="font-bold text-primary-600 truncate">{job.budget.toLocaleString()} ₫</p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <p className="text-neutral-500 font-semibold mb-1 text-xs">Applicants</p>
                  <p className="font-bold text-neutral-900">{job.applications?.length || 0}</p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <p className="text-neutral-500 font-semibold mb-1 text-xs">Team</p>
                  <p className="font-bold text-neutral-900">{(job.members?.length || 1) - 1}/{job.positions}</p>
                </div>
              </div>

              <Button 
                onClick={() => setSelectedJob(job)}
                variant="outline" 
                className="w-full border-neutral-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 font-bold justify-between group-hover:border-primary-500"
              >
                Manage Job <ChevronRight size={18} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // STATE 3: Manage Specific Job View
  return (
    <JobManageDetailView 
      job={selectedJob} 
      onBack={() => setSelectedJob(null)} 
    />
  );
};

// Subcomponent for Managing a Job
const JobManageDetailView = ({ job, onBack }: { job: any, onBack: () => void }) => {
  const queryClient = useQueryClient();
  const [addBudgetAmount, setAddBudgetAmount] = useState('');

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['job-applications', job.id],
    queryFn: () => projectService.getApplications(job.id)
  });

  const approveMutation = useMutation({
    mutationFn: (appId: string) => projectService.updateApplicationStatus(job.id, appId, 'APPROVED'),
    onSuccess: () => {
      toast.success('Applicant Approved!');
      queryClient.invalidateQueries({ queryKey: ['job-applications', job.id] });
      queryClient.invalidateQueries({ queryKey: ['projects-owned'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (appId: string) => projectService.updateApplicationStatus(job.id, appId, 'REJECTED'),
    onSuccess: () => {
      toast.error('Applicant Rejected.');
      queryClient.invalidateQueries({ queryKey: ['job-applications', job.id] });
    }
  });

  const budgetMutation = useMutation({
    mutationFn: (amount: number) => projectService.updateProject(job.id, { budget: job.budget + amount }),
    onSuccess: () => {
      toast.success('Budget added successfully!');
      setAddBudgetAmount('');
      queryClient.invalidateQueries({ queryKey: ['projects-owned'] });
      job.budget += parseFloat(addBudgetAmount);
    }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in slide-in-from-right-4 duration-300">
      <Button variant="ghost" onClick={onBack} className="mb-6 -ml-4 text-neutral-500 font-bold hover:text-neutral-900">
        ← Back to Dashboard
      </Button>
      
      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 mb-2">{job.title}</h2>
          <div className="flex items-center gap-3 text-sm font-semibold text-neutral-500">
            <span className="bg-neutral-100 px-3 py-1 rounded-full">Status: {job.status}</span>
            <span>Total Escrow: <span className="text-primary-600 font-black text-lg">{job.budget.toLocaleString()} ₫</span></span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-500/20 gap-2">
              <DollarSign size={18} /> Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Add Budget to Escrow</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-neutral-500 font-medium">Inject more funds into this project's escrow to hire more freelancers or extend milestones.</p>
              <input 
                type="number" 
                value={addBudgetAmount} 
                onChange={e => setAddBudgetAmount(e.target.value)}
                placeholder="Amount (VND)" 
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 font-bold text-lg outline-none focus:border-green-500" 
              />
              <Button 
                onClick={() => budgetMutation.mutate(parseFloat(addBudgetAmount))}
                disabled={!addBudgetAmount || budgetMutation.isPending}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl"
              >
                {budgetMutation.isPending ? 'Processing...' : 'Confirm Transfer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2"><Users size={20} /> Applicants Management</h3>
      
      {appsLoading ? (
        <div className="text-center py-10 text-neutral-400">Loading applicants...</div>
      ) : !applications || applications.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-3xl text-neutral-500 font-medium">
          No one has applied yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => (
            <div key={app.id} className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between hover:border-primary-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                  <img src={app.user?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.user?.email}`} alt="avatar" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">{app.user?.profile?.firstName || 'User'} {app.user?.profile?.lastName || ''}</h4>
                  <p className="text-xs text-neutral-500 font-medium">{app.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : app.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {app.status}
                </span>

                {app.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="font-bold h-8 text-xs rounded-lg">View Profile</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-[2rem] border-0">
                        <div className="bg-primary-500 h-24"></div>
                        <div className="px-8 pb-8 -mt-12 text-center">
                          <img src={app.user?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.user?.email}`} className="w-24 h-24 rounded-full border-4 border-white mx-auto mb-4 bg-white" />
                          <h2 className="text-2xl font-black text-neutral-900">{app.user?.profile?.firstName} {app.user?.profile?.lastName}</h2>
                          <p className="text-neutral-500 font-medium mb-6">{app.user?.profile?.title || 'No Title'}</p>
                          
                          <div className="text-left space-y-4">
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                              <p className="text-xs font-bold text-neutral-400 uppercase mb-2">Bio</p>
                              <p className="text-sm font-medium text-neutral-700">{app.user?.profile?.bio || 'No bio provided.'}</p>
                            </div>
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                              <p className="text-xs font-bold text-neutral-400 uppercase mb-2">Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {(app.user?.profile?.techSkills ? JSON.parse(app.user?.profile?.techSkills) : []).map((s: string, i: number) => (
                                  <span key={i} className="px-2 py-1 bg-white border border-neutral-200 text-xs font-bold rounded-md">{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={() => approveMutation.mutate(app.id)} size="sm" className="bg-green-500 hover:bg-green-600 text-white h-8 w-8 p-0 rounded-lg"><Check size={16} /></Button>
                    <Button onClick={() => rejectMutation.mutate(app.id)} size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 h-8 w-8 p-0 rounded-lg"><X size={16} /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
