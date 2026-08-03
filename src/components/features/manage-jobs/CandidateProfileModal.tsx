import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
} from '@/components/shared/atoms/dialog';
import { Button } from '@/components/shared/atoms/button';
import { Badge } from '@/components/shared/atoms/badge';
import { 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Award, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Calendar,
  X
} from 'lucide-react';

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onApprove: (appId: string) => void;
  onReject: (appId: string) => void;
  isProcessing?: boolean;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  application,
  onApprove,
  onReject,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  if (!application) return null;

  const candidate = application.user || {};
  const profile = candidate.profile || {};
  const skills: string[] = Array.isArray(profile.skills) ? profile.skills : [];
  const experiences = Array.isArray(profile.experiences) ? profile.experiences : [];
  const educations = Array.isArray(profile.educations) ? profile.educations : [];
  const certs = Array.isArray(profile.certifications) ? profile.certifications : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl"
      >
        {/* Header Banner - Clean White */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 relative bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-black shrink-0 shadow-md overflow-hidden">
              {candidate.avatarUrl ? (
                <img src={candidate.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                candidate.firstName?.[0] || candidate.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {candidate.firstName && candidate.lastName 
                    ? `${candidate.firstName} ${candidate.lastName}` 
                    : candidate.email?.split('@')[0]}
                </h2>
                <Badge className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                  application.status === 'APPROVED' 
                    ? 'bg-emerald-500 text-white' 
                    : application.status === 'REJECTED' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-amber-400 text-amber-950'
                }`}>
                  {application.status === 'APPROVED' 
                    ? t('candidateProfileModal.statusApproved') 
                    : application.status === 'REJECTED' 
                    ? t('candidateProfileModal.statusRejected') 
                    : t('candidateProfileModal.statusPending')}
                </Badge>
              </div>
              <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {candidate.email}
              </p>
              {profile.headline && (
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 font-semibold">
                  {profile.headline}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <FileText className="w-4 h-4 text-blue-600" /> {t('candidateProfileModal.coverLetterTitle')}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {application.coverLetter}
              </p>
            </div>
          )}

          {/* Bio / Giới thiệu */}
          {profile.bio && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> {t('candidateProfileModal.bioTitle')}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Skills / Kỹ năng */}
          {skills.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" /> {t('candidateProfileModal.skillsTitle')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience / Kinh nghiệm */}
          {experiences.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-500" /> {t('candidateProfileModal.expTitle')}
              </h3>
              <div className="space-y-2.5">
                {experiences.map((exp: any, index: number) => (
                  <div key={index} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{exp.position || exp.role}</div>
                    <div className="text-xs text-slate-500 font-medium">{exp.company} • {exp.duration || exp.year}</div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education / Học vấn */}
          {educations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-500" /> {t('candidateProfileModal.eduTitle')}
              </h3>
              <div className="space-y-2.5">
                {educations.map((edu: any, index: number) => (
                  <div key={index} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{edu.degree || edu.major}</div>
                    <div className="text-xs text-slate-500 font-medium">{edu.school || edu.institution} • {edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose} className="text-xs text-slate-500">
            {t('candidateProfileModal.close')}
          </Button>

          {application.status === 'PENDING' ? (
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                disabled={isProcessing}
                onClick={() => onReject(application.id)}
                className="rounded-xl text-xs px-5 py-2 font-bold"
              >
                <XCircle className="w-4 h-4 mr-1.5" /> {t('candidateProfileModal.rejectBtn')}
              </Button>
              <Button
                disabled={isProcessing}
                onClick={() => onApprove(application.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs px-6 py-2 font-bold shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> {t('candidateProfileModal.approveBtn')}
              </Button>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-500">
              {t('candidateProfileModal.processedStatus', { status: application.status })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

