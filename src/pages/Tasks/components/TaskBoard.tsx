import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Circle, GripVertical } from 'lucide-react';

interface TaskBoardProps {
  tasks: any[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: any) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskMove, onTaskClick }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const COLUMNS = [
    { id: 'OPEN', label: 'To Do', color: 'bg-neutral-100 text-neutral-700', icon: <Circle size={16} /> },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <Clock size={16} /> },
    { id: 'REVIEW', label: 'In Review', color: 'bg-orange-100 text-orange-700', icon: <AlertCircle size={16} /> },
    { id: 'DONE', label: 'Done', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={16} /> }
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a generic drag image so it doesn't look weird
    const dragIcon = document.createElement('div');
    dragIcon.className = 'w-4 h-4 bg-primary-500 rounded-full';
    document.body.appendChild(dragIcon);
    e.dataTransfer.setDragImage(dragIcon, -10, -10);
    setTimeout(() => document.body.removeChild(dragIcon), 0);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && draggedTaskId === taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        onTaskMove(taskId, newStatus);
      }
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="flex gap-6 overflow-x-auto custom-scrollbar h-[calc(100vh-200px)] pb-4 items-start">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => (t.status === col.id) || (col.id === 'OPEN' && !COLUMNS.map(c=>c.id).includes(t.status)));

        return (
          <div 
            key={col.id} 
            className={`flex-shrink-0 w-80 flex flex-col bg-neutral-50/50 rounded-2xl border ${dragOverCol === col.id ? 'border-primary-400 bg-primary-50/20' : 'border-neutral-200/60'} h-full transition-colors`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="p-4 flex items-center justify-between border-b border-neutral-200/50">
              <div className="flex items-center gap-2 font-bold text-neutral-800">
                <div className={`p-1.5 rounded-md ${col.color}`}>{col.icon}</div>
                {col.label}
              </div>
              <span className="bg-white text-neutral-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-neutral-100">
                {colTasks.length}
              </span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {colTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={() => setDraggedTaskId(null)}
                  onClick={() => onTaskClick(task)}
                  className={`bg-white p-4 rounded-xl shadow-sm border border-neutral-200 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all group ${draggedTaskId === task.id ? 'opacity-40 scale-95' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {task.project?.title || 'Bounty'}
                    </span>
                    <div className="text-neutral-300 group-hover:text-neutral-500 cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} />
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-neutral-900 text-sm mb-2 leading-tight group-hover:text-primary-600 transition-colors">
                    {task.title}
                  </h4>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex -space-x-2">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee?.id || 'unassigned'}`} className="w-6 h-6 rounded-full border-2 border-white bg-neutral-100" />
                    </div>
                    {task.budget > 0 && (
                      <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        {task.budget.toLocaleString()} ₫
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {colTasks.length === 0 && (
                <div className="h-24 border-2 border-dashed border-neutral-200 rounded-xl flex items-center justify-center text-neutral-400 text-sm font-medium">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
