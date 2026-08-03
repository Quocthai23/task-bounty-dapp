import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { projectService } from '@/services/project.service';
import { Card } from '@/components/shared/atoms/card';
import { Badge } from '@/components/shared/atoms/badge';
import { Input } from '@/components/shared/atoms/input';
import { SkeletonCard } from '@/components/shared/atoms/skeleton';
import type { ProjectResponseDto } from '@/types/api.types';

export const ProjectList: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects()
  });

  const projects = Array.isArray(data) ? data : data?.projects || [];
  const filteredProjects = projects.filter((p: ProjectResponseDto) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">{t('projects.publicProjects')}</h1>
        <p className="text-muted-foreground mb-8">{t('projects.discoverProjects')}</p>
        <div className="max-w-md">
          <Input
            type="search"
            placeholder={t('projects.searchProjects')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{t('projects.failedToLoad')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: ProjectResponseDto) => (
            <Card key={project.id} className="flex flex-col p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold leading-tight">{project.title}</h3>
                <Badge variant="success" className="shrink-0 ml-2">Public</Badge>
              </div>
              <div className="flex-grow flex flex-col gap-3 mb-6 text-sm">
                <p className="text-muted-foreground line-clamp-3">{project.description || 'No description available'}</p>
                <div className="flex items-center">
                  <span className="font-medium text-muted-foreground w-36">{t('projects.status')}</span>
                  <span>{t('projects.active')}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-muted-foreground w-36">{t('projects.totalBountyPool')}</span>
                  <span className="text-green-600 font-bold">${project.budget || 0}</span>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-border">
                <a href={`/projects/${project.id}`} className="text-primary hover:underline font-medium inline-flex items-center">
                  {t('projects.viewRoadmap')} <span className="ml-1">&rarr;</span>
                </a>
              </div>
            </Card>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              {t('projects.noProjectsFound')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

