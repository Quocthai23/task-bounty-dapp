import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import { BadgeCheck, Calendar, Briefcase, Mail, Code, Globe, Star } from 'lucide-react';
import { Button } from '@/components/shared/atoms/button';
import { UserAvatar } from '@/components/shared/atoms/Avatar';

export const PublicProfile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: async () => {
      const res = await api.get(`/profile/public/${username}`);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold text-neutral-800">{t('publicProfile.userNotFound')}</h2>
        <p className="text-neutral-500">{t('publicProfile.userNotFoundDesc')}</p>
        <Button onClick={() => navigate('/dashboard')} variant="primary-contained">{t('publicProfile.backHome')}</Button>
      </div>
    );
  }

  const role = profile.profile?.title || 'Chuyên gia Web3 / Freelancer';
  const joinDate = new Date(profile.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });
  const skills = profile.profile?.skills ? JSON.parse(profile.profile.skills) : [];
  const languages = profile.profile?.languages ? JSON.parse(profile.profile.languages) : [];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-neutral-50/50">
      {/* Top Navigation */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="rounded-full bg-white font-bold"
        >
          {t('publicProfile.backBtn')}
        </Button>
      </div>

      {/* Hero Bento Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-100 flex flex-col">
          <div className="h-40 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
          <div className="px-8 pb-8 relative flex-1 flex flex-col">
            <div className="rounded-3xl border-4 border-white bg-white shadow-xl -mt-16 mb-4 overflow-hidden shrink-0 inline-block w-fit">
              <UserAvatar user={profile} size="2xl" />
            </div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-3xl font-black text-neutral-900 flex items-center gap-2">
                  {profile.firstName} {profile.lastName}
                  <BadgeCheck size={24} className="text-blue-500" />
                </h1>
                <p className="text-lg font-bold text-neutral-500 mb-2">@{profile.username}</p>
                <p className="text-neutral-700 font-medium text-lg flex items-center gap-2">
                  <Briefcase size={18} /> {role}
                </p>
                <p className="text-neutral-500 text-sm flex items-center gap-2 mt-1">
                  <Calendar size={16} /> {t('common.joined', 'Joined')} {joinDate}
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="rounded-xl px-6 bg-primary-500 hover:bg-primary-600 shadow-md font-bold text-white">
                  {t('publicProfile.hireMe')}
                </Button>
                <Button variant="outline" className="rounded-xl px-4 shadow-sm border-neutral-200">
                  <Mail size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bento Box */}
        <div className="bg-neutral-900 rounded-3xl p-8 shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-5 bg-white rounded-full blur-3xl mix-blend-screen"></div>
          <div>
            <h3 className="text-neutral-400 font-bold uppercase tracking-wider text-sm mb-6">{t('publicProfile.performance')}</h3>
            <div className="space-y-6">
              <div>
                <p className="text-5xl font-black tracking-tight">{profile.stats?.totalJobs || 0}</p>
                <p className="text-neutral-400 font-medium mt-1">{t('publicProfile.completedJobs')}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-2xl font-black">{profile.stats?.rating || 'N/A'}</p>
                  <p className="text-neutral-400 text-sm font-medium">{t('publicProfile.averageRating')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black text-neutral-900 mb-4">{t('publicProfile.aboutUser')}</h3>
            <p className="text-neutral-600 leading-relaxed font-medium">
              {profile.profile?.bio || profile.profile?.experience || t('publicProfile.noBioYet')}
            </p>
          </div>

          {/* Real Work & Project History */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black text-neutral-900 mb-6">{t('publicProfile.projectHistory')}</h3>
            {(profile.completedTasks?.length > 0 || profile.projects?.length > 0) ? (
              <div className="space-y-4">
                {profile.completedTasks?.map((tTask: any) => (
                  <div key={tTask.id} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-neutral-900 text-base">{tTask.title}</h4>
                      <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{t('publicProfile.completedStatus')}</span>
                    </div>
                    {tTask.budget > 0 && (
                      <p className="text-neutral-500 text-xs font-mono font-bold mb-2">{t('common.tasks')}: {Number(tTask.budget).toLocaleString()} ₫</p>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400"><Star size={13} fill="currentColor" /><Star size={13} fill="currentColor" /><Star size={13} fill="currentColor" /><Star size={13} fill="currentColor" /><Star size={13} fill="currentColor" /></div>
                      <span className="text-xs font-bold text-neutral-400">5.0</span>
                    </div>
                  </div>
                ))}

                {profile.projects?.map((p: any) => (
                  <div key={p.id} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-neutral-900 text-base">{p.title}</h4>
                      <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{t('publicProfile.joinedProjectStatus')}</span>
                    </div>
                    <p className="text-neutral-500 text-xs">{p.type} • {Number(p.budget || 0).toLocaleString()} {p.currency || 'USD'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 font-medium text-center py-8">{t('publicProfile.noPublicProjects')}</p>
            )}
          </div>
        </div>

        {/* Right Column: Skills & Links */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black text-neutral-900 mb-6">{t('publicProfile.techSkills')}</h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span key={skill} className="px-4 py-2 bg-primary-50 text-primary-700 font-bold text-sm rounded-xl border border-primary-100">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm font-medium">{t('publicProfile.noSkills')}</p>
            )}

            {languages.length > 0 && (
              <>
                <h3 className="text-xl font-black text-neutral-900 mb-4 mt-8">{t('publicProfile.languages')}</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang: string) => (
                    <span key={lang} className="px-4 py-2 bg-neutral-100 text-neutral-700 font-bold text-sm rounded-xl">
                      {lang}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Links */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black text-neutral-900 mb-6">{t('publicProfile.links')}</h3>
            <div className="space-y-4">
              {profile.profile?.githubUrl && (
                <a href={profile.profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-neutral-700 font-bold">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Code size={20} />
                  </div>
                  {t('publicProfile.githubProfile')}
                </a>
              )}
              {profile.profile?.portfolioUrl && (
                <a href={profile.profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-neutral-700 font-bold">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  {t('publicProfile.portfolioSite')}
                </a>
              )}
              {!profile.profile?.githubUrl && !profile.profile?.portfolioUrl && (
                <p className="text-neutral-500 text-sm font-medium">{t('publicProfile.noLinks')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
