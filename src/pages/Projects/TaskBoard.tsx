import React from 'react';
import { Card } from '@/components/shared/atoms/card';
import { Badge } from '@/components/shared/atoms/badge';
import './Projects.css';

interface Task {
  id: string;
  title: string;
  bounty: number;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  riskScore?: number;
}

export const TaskBoard: React.FC = () => {
  const tasks: Task[] = [
    { id: 't1', title: 'Design DB Schema', bounty: 200, status: 'DONE' },
    { id: 't2', title: 'Implement Smart Contract Events', bounty: 500, status: 'IN_PROGRESS', riskScore: 20 },
    { id: 't3', title: 'Build Frontend Dashboard', bounty: 400, status: 'IN_PROGRESS', riskScore: 75 },
    { id: 't4', title: 'Integrate Web3 Wallets', bounty: 300, status: 'TODO' },
    { id: 't5', title: 'Write Unit Tests for Contracts', bounty: 250, status: 'TODO' },
    { id: 't6', title: 'Audit Token Logic', bounty: 800, status: 'REVIEW' },
  ];

  const columns: { id: Task['status']; title: string }[] = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'REVIEW', title: 'In Review' },
    { id: 'DONE', title: 'Done' },
  ];

  return (
    <div className="task-board">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="board-column glass-panel">
            <div className="board-column-header">
              <h3>{col.title}</h3>
              <span className="task-count">{colTasks.length}</span>
            </div>
            
            <div className="board-column-content">
              {colTasks.map(task => (
                <Card key={task.id} className="board-task-card">
                  <h4>{task.title}</h4>
                  
                  <div className="board-task-meta">
                    <span className="board-task-bounty">${task.bounty}</span>
                    
                    {task.riskScore !== undefined && task.status === 'IN_PROGRESS' && (
                      <Badge 
                        variant={task.riskScore > 60 ? 'destructive' : task.riskScore > 30 ? 'warning' : 'success'}
                      >
                        Risk: {task.riskScore}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
