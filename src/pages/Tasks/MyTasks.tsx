import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { TaskBoard } from './components/TaskBoard';
import { TaskList } from './components/TaskList';
import { TaskDetailSlider } from './components/TaskDetailSlider';
import { LayoutGrid, List, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const MyTasks: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['joined-tasks'],
    queryFn: () => taskService.getJoinedTasks(1, 100) // fetch up to 100 tasks for the board
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string, status: string }) => 
      taskService.updateTask(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['joined-tasks'] });
      const previousTasks = queryClient.getQueryData(['joined-tasks']);
      
      queryClient.setQueryData(['joined-tasks'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((t: any) => t.id === taskId ? { ...t, status } : t)
        };
      });

      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status });
      }

      return { previousTasks };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(['joined-tasks'], context.previousTasks);
      toast.error('Failed to update task status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['joined-tasks'] });
    }
  });

  const joinedTasks = (tasksData as any)?.data || [];

  const handleTaskMove = (taskId: string, newStatus: string) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50 -m-8 p-8 overflow-hidden">
      
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            My Workspace
            {isLoading && <Loader2 size={20} className="animate-spin text-primary-500" />}
          </h1>
          <p className="text-neutral-500 font-medium mt-1">Manage and track your active tasks.</p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0 bg-white p-1 rounded-xl shadow-sm border border-neutral-200">
          <button 
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'board' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'}`}
          >
            <LayoutGrid size={16} /> Board
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'list' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'}`}
          >
            <List size={16} /> List
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {isLoading && !tasksData ? (
          <div className="h-full flex items-center justify-center text-neutral-400 font-bold">
            Loading your workspace...
          </div>
        ) : viewMode === 'board' ? (
          <TaskBoard 
            tasks={joinedTasks} 
            onTaskMove={handleTaskMove} 
            onTaskClick={setSelectedTask} 
          />
        ) : (
          <div className="overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
            <TaskList 
              tasks={joinedTasks} 
              onTaskClick={setSelectedTask} 
            />
          </div>
        )}
      </div>

      {/* Detail Slider */}
      <TaskDetailSlider 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={(taskId, status) => handleTaskMove(taskId, status)}
      />

    </div>
  );
};
