import React, { useState, useRef } from 'react';
import { Button } from '@/components/shared/atoms/button';
import { Checkbox } from '@/components/shared/atoms/checkbox';
import { ChevronDown, ChevronUp, Trash2, Upload, FileText, CheckCircle2, Circle } from 'lucide-react';
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
  const [bioText, setBioText] = useState(user?.profile?.bio || 'Click to add a short biography about yourself.');

  // CV State
  const [isCvExpanded, setIsCvExpanded] = useState(false);
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

  const handleBioKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBioBlur();
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

  return (
    <div className="p-8 space-y-12 animate-in fade-in duration-300">

      {/* Bio */}
      <div>
        <h3 className="text-xl font-black text-neutral-900 mb-4">Bio</h3>
        {isEditingBio ? (
          <textarea
            autoFocus
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            onBlur={handleBioBlur}
            onKeyDown={handleBioKeyDown}
            className="w-full max-w-4xl min-h-[120px] bg-white p-6 rounded-2xl border-2 border-primary-500 focus:outline-none shadow-sm text-neutral-800 leading-relaxed resize-y"
          />
        ) : (
          <div
            onClick={() => setIsEditingBio(true)}
            className="max-w-4xl bg-neutral-50 hover:bg-neutral-100 p-6 rounded-2xl border border-neutral-100 cursor-pointer transition-colors group"
          >
            <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{bioText}</p>
            <p className="text-xs text-neutral-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to edit. Press Enter to save.</p>
          </div>
        )}
      </div>

      {/* CV Manager */}
      <div>
        <div className="flex items-center gap-6 border-b-2 border-primary-500 pb-2 max-w-4xl">
          <h3 className="text-lg font-black text-primary-500 w-24 shrink-0">CVs</h3>
          <div className="flex-1 flex flex-wrap gap-x-6 gap-y-3">
            {cvs.length === 0 ? (
              <span className="text-sm font-medium text-neutral-400">No CV uploaded yet</span>
            ) : (
              cvs.map((cv: any) => (
                <label key={cv.id} className="flex items-center gap-2 cursor-pointer group">
                  <div onClick={() => primaryCvMutation.mutate(cv.id)}>
                    {cv.isPrimary ? (
                      <CheckCircle2 size={18} className="text-primary-500" />
                    ) : (
                      <Circle size={18} className="text-neutral-300 group-hover:text-primary-300" />
                    )}
                  </div>
                  <span className={`text-sm font-bold ${cv.isPrimary ? 'text-primary-600' : 'text-neutral-600'}`}>
                    {cv.name}
                  </span>
                </label>
              ))
            )}
          </div>
          <button
            onClick={() => setIsCvExpanded(!isCvExpanded)}
            className="text-primary-500 hover:bg-primary-50 p-1 rounded-full transition-colors"
          >
            {isCvExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>

        {/* CV Upload Area */}
        {isCvExpanded && (
          <div className="max-w-4xl mt-4 bg-neutral-50 rounded-2xl p-6 border border-neutral-100 animate-in slide-in-from-top-2">
            <h4 className="text-sm font-bold text-neutral-800 mb-4">Manage Uploaded CVs</h4>
            <div className="space-y-3 mb-6">
              {cvs.map((cv: any) => (
                <div key={cv.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-neutral-400" />
                    <a href={cv.base64} download={cv.name} className="text-sm font-semibold text-neutral-700 hover:text-primary-500 hover:underline">{cv.name}</a>
                    {cv.isPrimary && <span className="text-[10px] uppercase font-black bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">Primary</span>}
                  </div>
                  <button
                    onClick={() => deleteCvMutation.mutate(cv.id)}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {cvs.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">Upload a PDF or Word document to get started.</p>}
            </div>

            <div className="flex justify-center">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx" />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadCvMutation.isPending}
                className="!bg-white border-2 border-dashed border-primary-500 text-primary-500 font-bold hover:bg-primary-50 flex items-center gap-2 p-2"
              >
                <Upload size={18} />
                {uploadCvMutation.isPending ? 'Uploading...' : 'Upload New CV'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Social Links */}
      <div className="max-w-4xl">
        <h3 className="text-xl font-black text-neutral-900 mb-4">Social</h3>

        {isEditingSocials ? (
          <div className="space-y-4 bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
            {['github', 'facebook', 'instagram', 'linkedin'].map(network => (
              <div key={network} className="flex items-center gap-4">
                <label className="w-24 text-sm font-bold text-neutral-700 capitalize">{network}:</label>
                <input
                  type="text"
                  value={socials[network] || ''}
                  onChange={(e) => setSocials({ ...socials, [network]: e.target.value })}
                  className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  placeholder={`https://${network}.com/username`}
                />
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Button onClick={() => socialsMutation.mutate(socials)} className="bg-primary-500 font-bold px-8">Save Links</Button>
              <Button variant="primary-outline" onClick={() => setIsEditingSocials(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-3 text-neutral-600 font-medium">
              {['github', 'facebook', 'instagram', 'linkedin'].map(network => (
                <p key={network} className="flex gap-2">
                  <span className="w-20 capitalize text-neutral-500 font-bold">{network}:</span>
                  {socials[network] ? (
                    <a href={socials[network]} target="_blank" rel="noreferrer" className="text-neutral-800 hover:text-primary-500 truncate max-w-[300px] sm:max-w-md">
                      {socials[network]}
                    </a>
                  ) : (
                    <span className="text-neutral-300 italic">Not set</span>
                  )}
                </p>
              ))}
            </div>
            <div className="mt-6">
              <Button
                onClick={() => setIsEditingSocials(true)}
                variant="primary-outline"
                className="rounded-lg font-bold px-8 shadow-sm"
              >
                Edit Socials
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
