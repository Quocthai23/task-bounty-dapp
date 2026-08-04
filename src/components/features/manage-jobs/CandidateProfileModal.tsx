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
  DollarSign,
  Globe,
  Download,
  Eye,
  FileCheck,
  Phone,
  MessageSquare,
  X
} from 'lucide-react';

const Github = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);


interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onApprove: (appId: string) => void;
  onReject: (appId: string) => void;
  isProcessing?: boolean;
}

const safeParseJson = (data: any, fallback: any = []) => {
  if (!data) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

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

  // Safely parse JSON strings stored in database
  const skills: string[] = safeParseJson(profile.skills, []);
  const experiences = safeParseJson(profile.experience || profile.experiences, []);
  const educations = safeParseJson(profile.languages || profile.educations, []);
  const cvs = safeParseJson(profile.cvs, []);
  const socialLinks = safeParseJson(profile.socialLinks, {});

  const handleDownloadCv = (cv: any) => {
    if (cv.url) {
      window.open(cv.url, '_blank');
    } else if (cv.base64) {
      const link = document.createElement('a');
      link.href = cv.base64;
      link.download = cv.name || 'Candidate_CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl"
      >
        {/* Header Banner */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 relative bg-slate-50/70 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shrink-0 shadow-lg overflow-hidden">
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
                    : candidate.username || candidate.email?.split('@')[0]}
                </h2>
                <Badge className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                  application.status === 'APPROVED' 
                    ? 'bg-emerald-500 text-white' 
                    : application.status === 'REJECTED' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-amber-400 text-amber-950'
                }`}>
                  {application.status === 'APPROVED' 
                    ? t('candidateProfileModal.statusApproved') || 'Đã chấp nhận' 
                    : application.status === 'REJECTED' 
                    ? t('candidateProfileModal.statusRejected') || 'Đã từ chối' 
                    : t('candidateProfileModal.statusPending') || 'Đang chờ duyệt'}
                </Badge>
              </div>

              {profile.title && (
                <p className="text-blue-600 dark:text-blue-400 text-sm font-bold mt-0.5">
                  {profile.title}
                </p>
              )}

              {/* Quick Info Bar */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {candidate.email}
                </span>

                {profile.contactInfo && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> {profile.contactInfo}
                  </span>
                )}

                {profile.expectedRate && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <DollarSign className="w-3.5 h-3.5" /> ${profile.expectedRate}/giờ
                  </span>
                )}

                {profile.birthYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Sinh năm {profile.birthYear}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Social Links Bar */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-blue-500 transition-colors"
              >
                <Github className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> GitHub
              </a>
            )}

            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-blue-500 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" /> Portfolio
              </a>
            )}

            {socialLinks?.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-blue-500 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn
              </a>
            )}

            {socialLinks?.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-blue-500 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5 text-sky-500" /> Twitter
              </a>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                <FileText className="w-4 h-4 text-blue-600" /> {t('candidateProfileModal.coverLetterTitle') || 'Thư Ứng Tuyển (Cover Letter)'}
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                {application.coverLetter}
              </p>
            </div>
          )}

          {/* CV Attachments */}
          {Array.isArray(cvs) && cvs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" /> Hồ Sơ CV Đính Kèm ({cvs.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cvs.map((cv: any, index: number) => (
                  <div 
                    key={cv.id || index}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {cv.name || `Curriculum Vitae #${index + 1}`}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {cv.size ? `${(cv.size / 1024 / 1024).toFixed(2)} MB` : 'Tệp CV'} {cv.isPrimary && '• Mặc định'}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadCv(cv)}
                      className="rounded-xl h-8 px-3 text-xs font-bold flex items-center gap-1 shrink-0 bg-white dark:bg-slate-900"
                    >
                      <Download className="w-3.5 h-3.5" /> Tải về
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> {t('candidateProfileModal.bioTitle') || 'Giới Thiệu Bản Thân'}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {Array.isArray(skills) && skills.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" /> {t('candidateProfileModal.skillsTitle') || 'Kỹ Năng & Chuyên Môn'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any, index: number) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name || skill.title;
                  return (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    >
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Experience */}
          {Array.isArray(experiences) && experiences.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-500" /> {t('candidateProfileModal.expTitle') || 'Kinh Nghiệm Làm Việc'}
              </h3>
              <div className="space-y-2.5">
                {experiences.map((exp: any, index: number) => (
                  <div key={index} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {exp.position || exp.role || exp.title}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {exp.company || exp.workplace} {exp.duration ? `• ${exp.duration}` : exp.year ? `• ${exp.year}` : ''}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education & Certifications */}
          {Array.isArray(educations) && educations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-500" /> {t('candidateProfileModal.eduTitle') || 'Học Vấn & Chứng Chỉ'}
              </h3>
              <div className="space-y-2.5">
                {educations.map((edu: any, index: number) => (
                  <div key={index} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{edu.degree || edu.major || edu.name}</div>
                    <div className="text-xs text-slate-500 font-medium">{edu.school || edu.institution || edu.issuer} {edu.year ? `• ${edu.year}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose} className="text-xs text-slate-500">
            {t('candidateProfileModal.close') || 'Đóng'}
          </Button>

          {application.status === 'PENDING' ? (
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                disabled={isProcessing}
                onClick={() => onReject(application.id)}
                className="rounded-xl text-xs px-5 py-2 font-bold cursor-pointer"
              >
                <XCircle className="w-4 h-4 mr-1.5" /> {t('candidateProfileModal.rejectBtn') || 'Từ Chối'}
              </Button>
              <Button
                disabled={isProcessing}
                onClick={() => onApprove(application.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs px-6 py-2 font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> {t('candidateProfileModal.approveBtn') || 'Chấp Nhận Ứng Tuyển'}
              </Button>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-500">
              Trạng thái: {application.status}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

