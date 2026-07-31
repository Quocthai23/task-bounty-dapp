import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { Card } from '@/components/shared/atoms/card';
import { Badge } from '@/components/shared/atoms/badge';
import { Input } from '@/components/shared/atoms/input';
import './Projects.css';

export const ProjectList: React.FC = () => {
  const [search, setSearch] = useState('');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects()
  });

  const projects = Array.isArray(data) ? data : data?.projects || [];
  const filteredProjects = projects.filter((p: any) => 
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Public Projects</h1>
        <p>Discover open source projects and earn bounties by completing tasks.</p>
        <div style={{ marginTop: '2rem', maxWidth: '400px' }}>
          <Input 
            type="search" 
            placeholder="Search projects by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading projects...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">Failed to load projects</div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project: any) => (
            <Card key={project.id} className="project-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <Badge variant="success">Public</Badge>
              </div>
              <div className="project-card-body">
                <p>{project.description || project.desc || 'No description available'}</p>
                <div className="metric"><span>Status:</span> {project.status || 'Active'}</div>
                <div className="metric"><span>Total Bounty Pool:</span> <span className="text-success">${project.budget || 0}</span></div>
              </div>
              <div className="project-card-actions">
                <a href={`/projects/${project.id}`} className="view-link">View Roadmap &rarr;</a>
              </div>
            </Card>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              No projects found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

