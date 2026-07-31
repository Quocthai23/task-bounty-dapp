import React from 'react';
import { Card } from '@/components/shared/atoms/card';
import { Button } from '@/components/shared/atoms/button';
import { Badge } from '@/components/shared/atoms/badge';
import { RiskAlertBanner } from '../../components/AI/RiskAlertBanner';
import './Dashboard.css';

export const PMDashboard: React.FC = () => {
  // Mock Data
  const projects = [
    { id: 1, name: 'DeFi Exchange V2', visibility: 'Public', status: 'Active', members: 12, budget: 5000 },
    { id: 2, name: 'Internal Tools Migration', visibility: 'Private', status: 'Planning', members: 4, budget: 1200 },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, PM</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
        <Button variant="primary-contained">+ New Project</Button>
      </header>

      <RiskAlertBanner />

      <div className="dashboard-stats grid-3">
        <Card className="glass-panel stat-card">
          <h3>Total Active Projects</h3>
          <div className="stat-value">8</div>
        </Card>
        <Card className="glass-panel stat-card">
          <h3>Total Budget Allocated</h3>
          <div className="stat-value gradient-text">$24,500</div>
        </Card>
        <Card className="glass-panel stat-card">
          <h3>Pending Task Reviews</h3>
          <div className="stat-value text-warning">14</div>
        </Card>
      </div>

      <section className="dashboard-section">
        <h2>Your Projects</h2>
        <div className="project-grid">
          {projects.map(p => (
            <Card key={p.id} className="project-card">
              <div className="project-card-header">
                <h3>{p.name}</h3>
                <Badge variant={p.visibility === 'Public' ? 'success' : 'default'}>{p.visibility}</Badge>
              </div>
              <div className="project-card-body">
                <div className="metric"><span>Members:</span> {p.members}</div>
                <div className="metric"><span>Budget:</span> ${p.budget}</div>
              </div>
              <div className="project-card-actions">
                <a href={`/projects/${p.id}`} className="view-link">View Project &rarr;</a>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
