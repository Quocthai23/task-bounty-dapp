import React from 'react';
import { Wallet } from '@/pages/Wallet/Wallet';

export const ProfilePayment: React.FC = () => {
  return (
    <div className="p-2 sm:p-4 animate-in fade-in duration-300">
      <Wallet />
    </div>
  );
};

export default ProfilePayment;
