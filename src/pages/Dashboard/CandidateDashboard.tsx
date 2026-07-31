import React from 'react';
import { Card } from '@/components/shared/atoms/card';
import { Badge } from '@/components/shared/atoms/badge';
import './Dashboard.css';

export const CandidateDashboard: React.FC = () => {
  // Mock Data
  const tasksInProgress = [
    { id: 1, title: 'Implement Smart Contract Events', project: 'DeFi Exchange V2', bounty: 400, status: 'IN_PROGRESS' },
    { id: 2, title: 'UI Redesign for Staking Page', project: 'DeFi Exchange V2', bounty: 250, status: 'REVIEW' },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, Candidate</h1>
          <p>Ready to crush some tasks and earn bounties?</p>
        </div>
        <Card className="wallet-card">
          <div className="wallet-label">Current Balance</div>
          <div className="wallet-amount gradient-text">$1,250.00</div>
        </Card>
      </header>

      <section className="dashboard-section">
        <h2>Your Active Tasks</h2>
        <div className="task-list">
          {tasksInProgress.map(task => (
            <Card key={task.id} className="task-list-item">
              <div className="task-info">
                <h4>{task.title}</h4>
                <div className="task-meta">
                  <span className="project-name">{task.project}</span>
                  <Badge variant={task.status === 'REVIEW' ? 'warning' : 'default'}>{task.status.replace('_', ' ')}</Badge>
                </div>
              </div>
              <div className="task-bounty">
                <span className="bounty-label">Reward</span>
                <span className="bounty-value">${task.bounty}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
      
      <section className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Suggested Public Projects</h2>
          <a href="/projects" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>Browse all &rarr;</a>
        </div>
        <div className="project-grid">
          <Card className="glass-panel project-card">
            <div className="project-card-header">
              <h3>NFT Marketplace</h3>
              <Badge variant="success">Public</Badge>
            </div>
            <div className="project-card-body">
              <p>Looking for fullstack developers to build an NFT marketplace on Ethereum.</p>
              <div className="metric"><span>Open Tasks:</span> 5</div>
              <div className="metric"><span>Total Bounty pool:</span> $12,000</div>
            </div>
            <div className="project-card-actions">
              <a href={`/projects/3`} className="view-link">View Details &rarr;</a>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
