import React, { useState } from 'react';
import { Button } from '@/components/shared/atoms/button';
import { BadgeCheck, Edit2 } from 'lucide-react';
import { Dialog, SheetContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/shared/atoms/dialog';
import { profileService } from '@/services/profile.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageUpload } from '@/components/shared/atoms/image-upload';
import { TagInput } from '@/components/shared/atoms/tag-input';

interface ProfileHeaderProps {
  user: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, activeTab, onTabChange }) => {
  const tabs = ['Information', 'Jobs', 'History Log', 'Payment History', 'Job Manager'];
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    nickname: user?.nickname || '',
    gender: user?.profile?.gender || '',
    title: user?.profile?.title || '',
    avatarUrl: user?.avatarUrl || '',
    experience: user?.profile?.experience || '',
    skills: user?.profile?.skills ? JSON.parse(user.profile.skills) : [],
    languages: user?.profile?.languages ? JSON.parse(user.profile.languages) : [],
    githubUrl: user?.profile?.githubUrl || '',
    portfolioUrl: user?.profile?.portfolioUrl || '',
    expectedRate: user?.profile?.expectedRate || '',
  });

  const mutation = useMutation({
    mutationFn: profileService.updateBasicInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditOpen(false);
    }
  });

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const currentRole = user?.profile?.title || (user?.role === 'PM' ? 'Project Manager' : 'Software developer');
  const walletDisplay = user?.walletAddress 
    ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`
    : 'Not connected';

  return (
    <div className="bg-white rounded-t-3xl border-b border-neutral-100 shrink-0 shadow-sm relative z-10 transition-all duration-300">
      
      {/* Collapsible Section */}
      <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
        {/* Clean UI Banner */}
        <div className="h-24 bg-gradient-to-r from-neutral-50 to-neutral-100 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        
        {/* Profile Info */}
        <div className="px-8 pb-4 relative flex flex-col md:flex-row md:items-center md:justify-between -mt-10 z-10">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg shrink-0">
              <img src={user?.avatarUrl || "/assets/avatar.png"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left mt-2 md:mt-0">
              <h1 className="text-2xl font-black text-neutral-900 flex items-center justify-center md:justify-start gap-2">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : (user?.username || 'ThaiNguyen')}
                {user?.nickname && <span className="text-md font-semibold text-neutral-400">({user.nickname})</span>}
                <BadgeCheck size={20} className="text-blue-500" />
              </h1>
              <p className="text-neutral-500 font-semibold text-sm">{currentRole}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex justify-center md:justify-end shrink-0">
            <Button 
              onClick={() => setIsEditOpen(true)}
              variant="outline" 
              size="sm"
              className="rounded-full font-bold shadow-sm border-neutral-200 hover:bg-neutral-50 hover:text-primary-600 flex items-center gap-2 bg-white"
            >
              <Edit2 size={14} /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 md:px-8 flex items-center justify-between border-t border-neutral-100 bg-white">
        <div className="flex items-center gap-2 md:gap-8 overflow-x-auto custom-scrollbar flex-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-4 px-2 font-bold text-sm transition-colors relative whitespace-nowrap ${
                activeTab === tab ? 'text-primary-500' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors shrink-0 flex items-center gap-1"
          title={isCollapsed ? "Expand profile" : "Collapse profile"}
        >
          <span className="text-xs font-bold uppercase tracking-wider hidden md:block">
            {isCollapsed ? 'Expand' : 'Collapse'}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" height="16" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
            className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="overflow-y-auto custom-scrollbar p-0">
          <div className="p-6">
            <DialogHeader className="mb-4 border-b border-neutral-100 pb-4">
              <DialogTitle className="text-2xl font-black text-neutral-900">Edit Profile</DialogTitle>
            </DialogHeader>
          
          <div className="space-y-8 py-2">
            
            {/* Section 1: Basic & Identity */}
            <section>
              <h3 className="text-sm font-black uppercase text-neutral-400 tracking-wider mb-4">1. Basic & Identity</h3>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Avatar Image</label>
                  <ImageUpload 
                    value={formData.avatarUrl} 
                    onChange={(val) => setFormData({...formData, avatarUrl: val})} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-neutral-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-neutral-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700">Nickname</label>
                    <input 
                      type="text" 
                      value={formData.nickname}
                      onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-neutral-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-neutral-50/50"
                    >
                      <option value="">Select gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    Wallet Address <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full uppercase">Read-only</span>
                  </label>
                  <input 
                    type="text" 
                    readOnly
                    value={walletDisplay}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg bg-neutral-100 text-neutral-500 font-mono text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-neutral-400">Used for Web3 Escrow payments & smart contracts.</p>
                </div>
              </div>
            </section>

            {/* Section 2: Professional */}
            <section>
              <h3 className="text-sm font-black uppercase text-neutral-400 tracking-wider mb-4 border-t border-neutral-100 pt-6">2. Professional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Job Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    placeholder="e.g. Senior Frontend Developer"
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-neutral-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Expected Rate ($/hr)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={formData.expectedRate}
                      placeholder="e.g. 25"
                      onChange={(e) => setFormData({...formData, expectedRate: e.target.value})}
                      className="w-full pl-8 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-neutral-50/50"
                    />
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Experience</label>
                  <input 
                    type="text" 
                    value={formData.experience}
                    placeholder="e.g. 5 years building scalable web apps"
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-neutral-50/50"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Skills & Languages */}
            <section>
              <h3 className="text-sm font-black uppercase text-neutral-400 tracking-wider mb-4 border-t border-neutral-100 pt-6">3. Skills & Languages</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Tech Skills</label>
                  <TagInput 
                    tags={formData.skills} 
                    onChange={(tags) => setFormData({...formData, skills: tags})}
                    placeholder="Type a skill and press Enter (e.g. React, Nodejs)" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Language Proficiency</label>
                  <TagInput 
                    tags={formData.languages} 
                    onChange={(tags) => setFormData({...formData, languages: tags})}
                    placeholder="e.g. English IELTS 7.0, Japanese N3" 
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Links */}
            <section>
              <h3 className="text-sm font-black uppercase text-neutral-400 tracking-wider mb-4 border-t border-neutral-100 pt-6">4. Links & Portfolios</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Portfolio URL</label>
                  <input 
                    type="text" 
                    value={formData.portfolioUrl}
                    placeholder="https://my-portfolio.com"
                    onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-neutral-50/50"
                  />
                </div>
              </div>
            </section>

          </div>
          </div>

          <DialogFooter className="border-t border-neutral-100 p-6 flex justify-end gap-4 bg-neutral-50/50 mt-auto">
            <DialogClose asChild>
              <Button variant="outline" className="px-6 font-bold bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleSave} 
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 shadow-md" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </SheetContent>
      </Dialog>
    </div>
  );
};
