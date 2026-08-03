import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/shared/atoms/card';
import { Button } from '@/components/shared/atoms/button';
import { Trash2, Upload, FileText, CheckCircle2, Circle, FileBadge } from 'lucide-react';
import { profileService } from '@/services/profile.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const CvSection = ({ user }: { user: any }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvs = user?.profile?.cvs ? JSON.parse(user.profile.cvs) : [];

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
    <Card className="shadow-lg border-neutral-100/50 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      <CardHeader className="border-b border-neutral-100 dark:border-slate-800 pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileBadge size={24} className="text-primary-500" /> Resumes & CVs
          </CardTitle>
          <CardDescription className="text-neutral-500 dark:text-slate-400 font-medium">
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
          <div className="text-center py-12 px-4 border-2 border-dashed border-neutral-200 dark:border-slate-700 rounded-2xl bg-neutral-50/50 dark:bg-slate-800/40">
            <FileText size={48} className="mx-auto text-neutral-300 dark:text-slate-600 mb-4" />
            <h4 className="text-lg font-bold text-neutral-700 dark:text-slate-200">No resumes yet</h4>
            <p className="text-neutral-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">Upload a PDF or Word document to showcase your experience to potential clients.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cvs.map((cv: any) => (
              <div 
                key={cv.id} 
                className={`relative flex flex-col p-5 rounded-2xl border-2 transition-all ${
                  cv.isPrimary 
                    ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/30' 
                    : 'border-neutral-100 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-neutral-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div 
                    className="cursor-pointer group flex items-center gap-2"
                    onClick={() => !cv.isPrimary && primaryCvMutation.mutate(cv.id)}
                  >
                    {cv.isPrimary ? (
                      <CheckCircle2 size={24} className="text-primary-500" />
                    ) : (
                      <Circle size={24} className="text-neutral-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" />
                    )}
                    {cv.isPrimary && <span className="text-xs font-black uppercase text-primary-600 dark:text-primary-400 tracking-wider">Primary</span>}
                  </div>
                  <button
                    onClick={() => deleteCvMutation.mutate(cv.id)}
                    className="text-neutral-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 rounded-full transition-colors cursor-pointer"
                    title="Delete CV"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-neutral-500 dark:text-slate-300" />
                  </div>
                  <a 
                    href={cv.base64} 
                    download={cv.name} 
                    className="text-sm font-bold text-neutral-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 truncate transition-colors"
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
  );
};
