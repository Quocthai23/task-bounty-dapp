import React from 'react';
import { Clock, CheckCircle, AlertCircle, Circle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/shared/atoms/button';

interface TaskListProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick }) => {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Circle size={12}/> To Do</span>;
      case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock size={12}/> In Progress</span>;
      case 'REVIEW': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><AlertCircle size={12}/> In Review</span>;
      case 'DONE': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle size={12}/> Done</span>;
      default: return <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-bold">Unknown</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Task Name</th>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Reward</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 font-medium">
                  No tasks found in this view.
                </td>
              </tr>
            ) : tasks.map(task => (
              <tr key={task.id} className="hover:bg-primary-50/50 transition-colors cursor-pointer group" onClick={() => onTaskClick(task)}>
                <td className="px-6 py-4 font-bold text-neutral-900 group-hover:text-primary-600">
                  {task.title}
                </td>
                <td className="px-6 py-4 font-semibold text-neutral-500">
                  {task.project?.title || 'Unknown Project'}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(task.status)}
                </td>
                <td className="px-6 py-4">
                  {task.budget > 0 ? (
                    <span className="font-black text-green-600">{task.budget.toLocaleString()} ₫</span>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" className="h-8 px-3 text-primary-600 hover:bg-primary-100 font-bold rounded-lg text-xs">
                    View <ArrowRight size={14} className="ml-1" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
