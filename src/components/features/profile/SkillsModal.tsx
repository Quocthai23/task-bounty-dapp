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

export const SkillsModal: React.FC<Props> = ({ user, onClose }) => {
  const queryClient = useQueryClient();
  const profile = user?.profile || {};
  
  const [cvUrl, setCvUrl] = useState(profile.cvUrl || '');
  const [skills, setSkills] = useState(profile.skills ? JSON.parse(profile.skills).join(', ') : '');

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
      cvUrl,
      skills: skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold">Skills & CV</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">CV URL</label>
            <Input 
              placeholder="https://drive.google.com/..." 
              value={cvUrl} 
              onChange={e => setCvUrl(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Skills (comma separated)</label>
            <textarea 
              className="w-full flex min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="React, Node.js, Typescript..."
              value={skills} 
              onChange={e => setSkills(e.target.value)} 
            />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full mt-4">
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
};
