import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/shared/atoms/card';
import { Button } from '@/components/shared/atoms/button';
import { profileService } from '@/services/profile.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const BioSection = ({ user }: { user: any }) => {
  const queryClient = useQueryClient();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.profile?.bio || '');

  const bioMutation = useMutation({
    mutationFn: profileService.updateBio,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });

  const handleBioBlur = () => {
    setIsEditingBio(false);
    if (bioText !== user?.profile?.bio) {
      bioMutation.mutate(bioText);
    }
  };

  return (
    <Card className="shadow-lg border-neutral-100/50 bg-white/80 backdrop-blur-xl">
      <CardHeader className="border-b border-neutral-100 pb-4">
        <CardTitle className="text-2xl font-black flex items-center gap-2">
          Biography
        </CardTitle>
        <CardDescription className="text-neutral-500 font-medium">
          Share a bit about your background and experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isEditingBio ? (
          <div className="space-y-4">
            <textarea
              autoFocus
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              onBlur={handleBioBlur}
              placeholder="Write a short biography..."
              className="w-full min-h-[160px] bg-neutral-50/50 p-4 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none text-neutral-800 leading-relaxed resize-y transition-all"
            />
            <div className="flex justify-end gap-2">
              <Button onClick={handleBioBlur} className="font-bold rounded-lg px-6">Save Bio</Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingBio(true)}
            className="bg-neutral-50/50 hover:bg-neutral-100/50 p-6 rounded-xl border border-neutral-100 cursor-pointer transition-colors group relative overflow-hidden"
          >
            <p className={`leading-relaxed whitespace-pre-wrap ${!bioText ? 'text-neutral-400 italic' : 'text-neutral-700'}`}>
              {bioText || 'Click here to add your biography...'}
            </p>
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">Click to edit</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
