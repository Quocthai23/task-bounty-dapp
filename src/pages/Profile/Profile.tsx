import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileInformation } from './components/tabs/ProfileInformation';
import { ProfileJobs } from './components/tabs/ProfileJobs';
import { ProfileHistory } from './components/tabs/ProfileHistory';
import { ProfilePayment } from './components/tabs/ProfilePayment';
import { ProfileJobManager } from './components/tabs/ProfileJobManager';

export const Profile: React.FC = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: userService.getMe,
  });

  const [activeTab, setActiveTab] = useState('Information');

  return (
    <div className="h-full flex flex-col font-sans bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden relative">
      <ProfileHeader user={user} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-neutral-500 font-medium">Loading profile...</span>
          </div>
        ) : (
          <>
            {activeTab === 'Information' && <ProfileInformation user={user} />}
            {activeTab === 'Jobs' && <ProfileJobs />}
            {activeTab === 'History Log' && <ProfileHistory />}
            {(activeTab === 'Payment' || activeTab === 'Payment History') && <ProfilePayment />}
            {activeTab === 'Job Manager' && <ProfileJobManager />}
          </>
        )}
      </div>
    </div>
  );
};
