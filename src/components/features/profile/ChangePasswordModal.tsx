import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/shared/atoms/button';
import { Input } from '@/components/shared/atoms/input';
import { X, Eye, EyeOff } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<Props> = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: any) => authService.changePassword(data),
    onSuccess: () => {
      alert('Password changed successfully');
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({ oldPassword, newPassword });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold">Change Password</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-2 bg-red-500/10 text-red-500 rounded text-sm">{error}</div>}
          
          <div>
            <label className="text-sm font-medium mb-1 block">Current Password</label>
            <div className="relative">
              <Input type={showOld ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-2.5 text-muted-foreground">
                {showOld ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">New Password</label>
            <div className="relative">
              <Input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-muted-foreground">
                {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          
          <Button type="submit" disabled={mutation.isPending || !oldPassword || !newPassword} className="w-full mt-4">
            {mutation.isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};
