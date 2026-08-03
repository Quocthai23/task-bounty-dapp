import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/atoms/card';
import { Button } from '@/components/shared/atoms/button';
import { Input } from '@/components/shared/atoms/input';
import { profileService } from '@/services/profile.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Github = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const Facebook = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Instagram = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Linkedin = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

export const SocialsSection = ({ user }: { user: any }) => {
  const queryClient = useQueryClient();
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const defaultSocials = { github: '', facebook: '', instagram: '', linkedin: '' };
  const [socials, setSocials] = useState(user?.profile?.socialLinks ? JSON.parse(user.profile.socialLinks) : defaultSocials);

  const socialsMutation = useMutation({
    mutationFn: profileService.updateSocials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditingSocials(false);
    }
  });

  const socialIcons: any = {
    github: <Github size={18} />,
    facebook: <Facebook size={18} />,
    instagram: <Instagram size={18} />,
    linkedin: <Linkedin size={18} />
  };

  return (
    <Card className="shadow-lg border-neutral-100/50 bg-white/80 backdrop-blur-xl">
      <CardHeader className="border-b border-neutral-100 pb-4 flex justify-between flex-row items-center">
        <CardTitle className="text-xl font-black">Social Profiles</CardTitle>
        {!isEditingSocials && (
          <button 
            onClick={() => setIsEditingSocials(true)}
            className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Edit
          </button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {isEditingSocials ? (
          <div className="space-y-4">
            {Object.keys(defaultSocials).map(network => (
              <div key={network} className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                  {socialIcons[network]} {network}
                </label>
                <Input
                  type="text"
                  value={(socials as any)[network] || ''}
                  onChange={(e) => setSocials({ ...socials, [network]: e.target.value })}
                  placeholder={`https://${network}.com/`}
                  className="bg-neutral-50"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={() => socialsMutation.mutate(socials)} className="flex-1 font-bold">Save</Button>
              <Button variant="outline" onClick={() => setIsEditingSocials(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(defaultSocials).map(network => {
              const hasLink = !!(socials as any)[network];
              return (
                <div key={network} className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasLink ? 'bg-primary-50 text-primary-600' : 'bg-neutral-100 text-neutral-400'}`}>
                    {socialIcons[network]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-900 capitalize">{network}</p>
                    {hasLink ? (
                      <a href={(socials as any)[network]} target="_blank" rel="noreferrer" className="text-xs font-medium text-neutral-500 hover:text-primary-600 truncate block">
                        {(socials as any)[network]}
                      </a>
                    ) : (
                      <p className="text-xs font-medium text-neutral-400 italic">Not connected</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
