import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { BadgeCheck, Calendar, Briefcase, Mail, Code, Globe, Star } from 'lucide-react';
import { Button } from '@/components/shared/atoms/button';

export const PublicProfile: React.FC = () => {
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
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-neutral-500">
        <h2 className="text-2xl font-black mb-2 text-neutral-900">Profile Not Found</h2>
        <p className="mb-6">The user @{username} does not exist or their profile is private.</p>
        <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
      </div>
    );
  }

  const role = profile.profile?.title || 'Member';
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const skills = profile.profile?.skills ? JSON.parse(profile.profile.skills) : [];
  const languages = profile.profile?.languages ? JSON.parse(profile.profile.languages) : [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Bento Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-100 flex flex-col">
          <div className="h-40 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
          <div className="px-8 pb-8 relative flex-1 flex flex-col">
            <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white shadow-xl -mt-16 mb-4 overflow-hidden shrink-0">
              <img src={profile.avatarUrl || "/assets/avatar.png"} alt={profile.firstName} className="w-full h-full object-cover" />
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
                  <Calendar size={16} /> Joined {joinDate}
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="rounded-xl px-6 bg-primary-500 hover:bg-primary-600 shadow-md font-bold text-white">Hire Me</Button>
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
            <h3 className="text-neutral-400 font-bold uppercase tracking-wider text-sm mb-6">Performance</h3>
            <div className="space-y-6">
              <div>
                <p className="text-5xl font-black tracking-tight">{profile.stats?.totalJobs || 0}</p>
                <p className="text-neutral-400 font-medium mt-1">Total Jobs Completed</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-2xl font-black">{profile.stats?.rating || 'N/A'}</p>
                  <p className="text-neutral-400 text-sm font-medium">Average Rating</p>
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
            <h3 className="text-xl font-black text-neutral-900 mb-4">About</h3>
            <p className="text-neutral-600 leading-relaxed font-medium">
              {profile.profile?.bio || profile.profile?.experience || "This user hasn't added a bio yet."}
            </p>
          </div>

          {/* Work History (Mocked for UI) */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black text-neutral-900 mb-6">Recent Work</h3>
            {profile.stats?.totalJobs > 0 ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-neutral-900 text-lg">Senior Smart Contract Developer</h4>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Completed</span>
                    </div>
                    <p className="text-neutral-500 text-sm mb-3">Developed and audited a staking contract on Ethereum with zero vulnerabilities.</p>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
                      <span className="text-xs font-bold text-neutral-400">5.0</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 font-medium text-center py-8">No public jobs completed yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Skills & Links */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black text-neutral-900 mb-6">Tech Skills</h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span key={skill} className="px-4 py-2 bg-primary-50 text-primary-700 font-bold text-sm rounded-xl border border-primary-100">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm font-medium">No skills listed.</p>
            )}

            {languages.length > 0 && (
              <>
                <h3 className="text-xl font-black text-neutral-900 mb-4 mt-8">Languages</h3>
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
            <h3 className="text-xl font-black text-neutral-900 mb-6">Links</h3>
            <div className="space-y-4">
              {profile.profile?.githubUrl && (
                <a href={profile.profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-neutral-700 font-bold">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Code size={20} />
                  </div>
                  GitHub Profile
                </a>
              )}
              {profile.profile?.portfolioUrl && (
                <a href={profile.profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-neutral-700 font-bold">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  Personal Website
                </a>
              )}
              {!profile.profile?.githubUrl && !profile.profile?.portfolioUrl && (
                <p className="text-neutral-500 text-sm font-medium">No links available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
