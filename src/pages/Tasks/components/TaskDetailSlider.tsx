import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { X, Send, Clock, CheckCircle, AlertCircle, Circle, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/shared/atoms/button';
import { toast } from 'sonner';

interface TaskDetailSliderProps {
  task: any | null;
  onClose: () => void;
  onStatusChange: (taskId: string, status: string) => void;
}

export const TaskDetailSlider: React.FC<TaskDetailSliderProps> = ({ task, onClose, onStatusChange }) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['task-comments', task?.id],
    queryFn: () => taskService.getTaskComments(task!.id),
    enabled: !!task
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => taskService.addTaskComment(task!.id, content),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['task-comments', task!.id] });
    },
    onError: () => toast.error("Failed to post comment")
  });

  if (!task) return null;

  const comments = commentsData || [];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in bg-black/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {task.project?.title || 'Unknown Project'}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-neutral-50/30">
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-neutral-900 leading-tight">{task.title}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-neutral-500">
              <div className="flex items-center gap-2 bg-white px-4 py-2 border border-neutral-200 rounded-xl shadow-sm">
                <span className="text-neutral-400">Status:</span>
                <select 
                  value={task.status} 
                  onChange={(e) => onStatusChange(task.id, e.target.value)}
                  className="bg-transparent font-black text-neutral-900 outline-none cursor-pointer"
                >
                  <option value="OPEN">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              {task.budget > 0 && (
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-black">
                  <DollarSign size={16} /> {task.budget.toLocaleString()} ₫
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-black uppercase text-neutral-400 tracking-wider mb-4">Description</h3>
            <div className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {task.description || <span className="text-neutral-400 italic">No description provided.</span>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-sm font-black uppercase text-neutral-500 tracking-wider">Discussion & Activity</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {commentsLoading ? (
                <div className="text-center text-neutral-400 text-sm font-medium py-4">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-center text-neutral-400 text-sm font-medium py-8 italic">No comments yet. Start the conversation!</div>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.id}`} className="w-8 h-8 rounded-full border border-neutral-200 shrink-0 bg-neutral-50" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-neutral-900 text-sm">{comment.user?.firstName || 'User'}</span>
                        <span className="text-xs text-neutral-400 font-medium">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="bg-neutral-100/80 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-neutral-700">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-neutral-100 bg-white">
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..." 
                  className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
                <Button type="submit" disabled={!commentText.trim() || commentMutation.isPending} className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-4 shrink-0 shadow-md">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
