import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/shared/atoms/button';
import { Input } from '@/components/shared/atoms/input';
import { X } from 'lucide-react';

interface Props {
  user: any;
  onClose: () => void;
}

export const PersonalInfoModal: React.FC<Props> = ({ user, onClose }) => {
  const queryClient = useQueryClient();
  const profile = user?.profile || {};
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: profile.bio || '',
    gender: profile.gender || '',
    birthYear: profile.birthYear || '',
    contactInfo: profile.contactInfo || '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      birthYear: formData.birthYear ? parseInt(formData.birthYear as string, 10) : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold">Personal Info</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled />
            <p className="text-xs text-muted-foreground mt-1">Name cannot be changed here.</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Bio</label>
            <textarea 
              className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.bio} 
              onChange={e => setFormData({...formData, bio: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Gender</label>
              <Input value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Birth Year</label>
              <Input type="number" value={formData.birthYear} onChange={e => setFormData({...formData, birthYear: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Contact Info (Phone, etc.)</label>
            <Input value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full mt-4">
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
};
