import React, { useState } from 'react';
import { Badge } from '@/components/shared/atoms/badge';
import { Button } from '@/components/shared/atoms/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shared/atoms/dialog';
import { TaskBoard } from './TaskBoard';
import './Projects.css';

export const ProjectDetail: React.FC = () => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  const project = {
    id: '1',
    name: 'DeFi Lending Protocol',
    description: 'A decentralized lending platform utilizing flash loans and smart contract automation.',
    visibility: 'Public',
    budget: 15000,
    pm: 'Alice (TechLead)',
  };

  return (
    <div className="project-detail-container">
      <div className="project-detail-header glass-panel">
        <div className="pd-title-row">
          <h1>{project.name}</h1>
          <Badge variant="success">{project.visibility}</Badge>
        </div>
        <p className="pd-desc">{project.description}</p>
        
        <div className="pd-meta">
          <div className="pd-meta-item">
            <span className="label">Managed by</span>
            <span className="value">{project.pm}</span>
          </div>
          <div className="pd-meta-item">
            <span className="label">Total Budget</span>
            <span className="value gradient-text font-bold">${project.budget}</span>
          </div>
        </div>
        
        <div className="pd-actions">
          <Button variant="primary-contained" onClick={() => setIsApplyModalOpen(true)}>Apply to Join</Button>
          <Button variant="neutral-outline">Share Project</Button>
        </div>
      </div>

      <div className="project-board-section">
        <div className="section-title">
          <h2>Task Roadmap</h2>
          <p>Pick up tasks to earn bounties. Higher complexity = higher bounty.</p>
        </div>
        
        <TaskBoard />
      </div>

      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to Project</DialogTitle>
          </DialogHeader>
          <p style={{ marginBottom: '1rem' }}>Submit your profile and CV to the PM to join this project.</p>
          <div style={{ marginBottom: '1.5rem' }}>
            <strong>Project:</strong> {project.name}
          </div>
          <Button variant="primary-contained" style={{ width: '100%' }} onClick={() => setIsApplyModalOpen(false)}>Confirm Application</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
