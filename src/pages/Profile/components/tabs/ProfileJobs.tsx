import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { JobCard } from '@/components/features/jobs/JobCard';

export const ProfileJobs: React.FC = () => {
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects-profile-joined'],
    queryFn: () => projectService.getJoinedProjects()
  });

  const jobs = (projectsData as any) || [];

  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-4">
        {isLoading ? (
          <div className="text-center text-neutral-500 py-10">Loading your jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-neutral-500 py-10">No jobs found.</div>
        ) : (
          jobs.slice(0, 2).map((job: any) => (
            <JobCard key={job.id} job={job} onClick={() => {}} isJoined={true} />
          ))
        )}
      </div>
    </div>
  );
};
