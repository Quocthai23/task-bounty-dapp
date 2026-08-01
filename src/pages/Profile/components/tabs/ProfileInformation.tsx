import React, { useState, useRef } from 'react';
import { Button } from '@/components/shared/atoms/button';
import { Input } from '@/components/shared/atoms/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/shared/atoms/card';
import { Trash2, Upload, FileText, CheckCircle2, Circle, FileBadge } from 'lucide-react';

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
import { profileService } from '@/services/profile.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProfileInformationProps {
  user: any;
}

export const ProfileInformation: React.FC<ProfileInformationProps> = ({ user }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bio State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.profile?.bio || '');

  // CV State
  const cvs = user?.profile?.cvs ? JSON.parse(user.profile.cvs) : [];

  // Socials State
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const defaultSocials = { github: '', facebook: '', instagram: '', linkedin: '' };
  const [socials, setSocials] = useState(user?.profile?.socialLinks ? JSON.parse(user.profile.socialLinks) : defaultSocials);

  // Mutations
  const bioMutation = useMutation({
    mutationFn: profileService.updateBio,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });

  const socialsMutation = useMutation({
    mutationFn: profileService.updateSocials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditingSocials(false);
    }
  });

  const uploadCvMutation = useMutation({
    mutationFn: profileService.uploadCv,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });

  const deleteCvMutation = useMutation({
    mutationFn: profileService.deleteCv,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });

  const primaryCvMutation = useMutation({
    mutationFn: profileService.setPrimaryCv,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });

  // Handlers
  const handleBioBlur = () => {
    setIsEditingBio(false);
    if (bioText !== user?.profile?.bio) {
      bioMutation.mutate(bioText);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      uploadCvMutation.mutate({ name: file.name, base64 });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const socialIcons: any = {
    github: <Github size={18} />,
    facebook: <Facebook size={18} />,
    instagram: <Instagram size={18} />,
    linkedin: <Linkedin size={18} />
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Biography Card */}
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

          {/* Resumes & CVs Card */}
          <Card className="shadow-lg border-neutral-100/50 bg-white/80 backdrop-blur-xl">
            <CardHeader className="border-b border-neutral-100 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black flex items-center gap-2">
                  <FileBadge size={24} className="text-primary-500" /> Resumes & CVs
                </CardTitle>
                <CardDescription className="text-neutral-500 font-medium">
                  Manage your uploaded documents. Mark one as primary.
                </CardDescription>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx" />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadCvMutation.isPending}
                className="rounded-full shadow-md shrink-0"
              >
                <Upload size={16} className="mr-2" /> 
                {uploadCvMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {cvs.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                  <FileText size={48} className="mx-auto text-neutral-300 mb-4" />
                  <h4 className="text-lg font-bold text-neutral-700">No resumes yet</h4>
                  <p className="text-neutral-500 mt-1 max-w-sm mx-auto">Upload a PDF or Word document to showcase your experience to potential clients.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cvs.map((cv: any) => (
                    <div 
                      key={cv.id} 
                      className={`relative flex flex-col p-5 rounded-2xl border-2 transition-all ${cv.isPrimary ? 'border-primary-500 bg-primary-50/30' : 'border-neutral-100 bg-white hover:border-neutral-300'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div 
                          className="cursor-pointer group flex items-center gap-2"
                          onClick={() => !cv.isPrimary && primaryCvMutation.mutate(cv.id)}
                        >
                          {cv.isPrimary ? (
                            <CheckCircle2 size={24} className="text-primary-500" />
                          ) : (
                            <Circle size={24} className="text-neutral-300 group-hover:text-primary-400 transition-colors" />
                          )}
                          {cv.isPrimary && <span className="text-xs font-black uppercase text-primary-600 tracking-wider">Primary</span>}
                        </div>
                        <button
                          onClick={() => deleteCvMutation.mutate(cv.id)}
                          className="text-neutral-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                          title="Delete CV"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                          <FileText size={20} className="text-neutral-500" />
                        </div>
                        <a 
                          href={cv.base64} 
                          download={cv.name} 
                          className="text-sm font-bold text-neutral-800 hover:text-primary-600 truncate transition-colors"
                          title={cv.name}
                        >
                          {cv.name}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Social Profiles Card */}
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
                        value={socials[network] || ''}
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
                    const hasLink = !!socials[network];
                    return (
                      <div key={network} className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasLink ? 'bg-primary-50 text-primary-600' : 'bg-neutral-100 text-neutral-400'}`}>
                          {socialIcons[network]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-neutral-900 capitalize">{network}</p>
                          {hasLink ? (
                            <a href={socials[network]} target="_blank" rel="noreferrer" className="text-xs font-medium text-neutral-500 hover:text-primary-600 truncate block">
                              {socials[network]}
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
          
        </div>
      </div>
    </div>
  );
};
