import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services/user.service';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileInformation } from './components/tabs/ProfileInformation';
import { ProfileJobs } from './components/tabs/ProfileJobs';
import { ProfileHistory } from './components/tabs/ProfileHistory';
import { ProfilePayment } from './components/tabs/ProfilePayment';
import { ProfileJobManager } from './components/tabs/ProfileJobManager';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: userService.getMe,
  });

  const [activeTab, setActiveTab] = useState('Information');

  return (
    <div className="h-full flex flex-col font-sans bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-neutral-100 dark:border-slate-800 overflow-hidden relative">
      <ProfileHeader user={user} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-slate-900">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-neutral-500 dark:text-slate-400 font-medium">{t('profile.loadingProfile')}</span>
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

