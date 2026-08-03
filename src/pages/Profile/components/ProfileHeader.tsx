import React, { useState } from 'react';
import { Button } from '@/components/shared/atoms/button';
import { BadgeCheck, Edit2 } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { UserAvatar } from '@/components/shared/atoms/Avatar';

interface ProfileHeaderProps {
  user: any; // Using any for now as the exact type matching frontend usage is complex, will fix if possible.
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, activeTab, onTabChange }) => {
  const tabs = ['Information', 'Jobs', 'History Log', 'Payment', 'Job Manager'];
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentRole = user?.profile?.title || (user?.role === 'PM' ? 'Project Manager' : 'Software developer');

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
            <div className="rounded-full border-4 border-white overflow-hidden bg-white shadow-lg shrink-0">
              <UserAvatar user={user} size="2xl" />
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

      <EditProfileModal 
        user={user} 
        isOpen={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />
    </div>
  );
};
