import React from 'react';
import { BioSection } from './info/BioSection';
import { CvSection } from './info/CvSection';
import { SocialsSection } from './info/SocialsSection';

interface ProfileInformationProps {
  user: any;
}

export const ProfileInformation: React.FC<ProfileInformationProps> = ({ user }) => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          <BioSection user={user} />
          <CvSection user={user} />
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <SocialsSection user={user} />
        </div>
      </div>
    </div>
  );
};
