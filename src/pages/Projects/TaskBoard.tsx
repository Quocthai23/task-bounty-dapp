import React from 'react';
import { Card } from '@/components/shared/atoms/card';
import { Badge } from '@/components/shared/atoms/badge';

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
    <div className="flex gap-6 overflow-x-auto pb-4 min-h-[500px]">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="flex-none w-80 flex flex-col bg-neutral-50/50 rounded-xl p-4 border border-neutral-200">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-base uppercase tracking-wider font-semibold text-neutral-500">{col.title}</h3>
              <span className="bg-white px-2 py-1 rounded-full text-xs font-bold text-neutral-500 shadow-sm border border-neutral-100">{colTasks.length}</span>
            </div>
            
            <div className="flex flex-col gap-4 flex-grow">
              {colTasks.map(task => (
                <Card key={task.id} className="p-5 cursor-pointer hover:shadow-md transition-shadow bg-white rounded-xl border border-neutral-200">
                  <h4 className="text-base font-medium mb-4 leading-snug text-neutral-800">{task.title}</h4>
                  
                  <div className="flex justify-between items-center border-t border-neutral-100 pt-3 mt-2">
                    <span className="font-bold text-green-600">${task.bounty}</span>
                    
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
