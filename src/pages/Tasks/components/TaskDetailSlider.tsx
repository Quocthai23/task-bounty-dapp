import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { 
  X, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Circle, 
  Coins, 
  Calendar,
  User,
  ShieldCheck,
  Tag,
  Copy,
  ChevronRight,
  Sparkles,
  MessageSquare,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/shared/atoms/button';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { UserAvatar } from '@/components/shared/atoms/Avatar';

interface TaskDetailSliderProps {
  task: any | null;
  onClose: () => void;
  onStatusChange: (taskId: string, status: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  OPEN: { 
    label: 'To Do (Cần làm)', 
    bg: 'bg-slate-100 dark:bg-slate-800', 
    text: 'text-slate-700 dark:text-slate-300', 
    border: 'border-slate-300 dark:border-slate-700',
    icon: <Circle className="w-3.5 h-3.5" />
  },
  IN_PROGRESS: { 
    label: 'In Progress (Đang làm)', 
    bg: 'bg-blue-50 dark:bg-blue-950/50', 
    text: 'text-blue-700 dark:text-blue-300', 
    border: 'border-blue-200 dark:border-blue-800',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  REVIEW: { 
    label: 'In Review (Đang duyệt)', 
    bg: 'bg-amber-50 dark:bg-amber-950/50', 
    text: 'text-amber-700 dark:text-amber-300', 
    border: 'border-amber-200 dark:border-amber-800',
    icon: <AlertCircle className="w-3.5 h-3.5" />
  },
  DONE: { 
    label: 'Done (Hoàn thành)', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/50', 
    text: 'text-emerald-700 dark:text-emerald-300', 
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />
  },
};

export const TaskDetailSlider: React.FC<TaskDetailSliderProps> = ({ task, onClose, onStatusChange }) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['task-comments', task?.id],
    queryFn: () => taskService.getTaskComments(task!.id),
    enabled: !!task?.id
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => taskService.addTaskComment(task!.id, content),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['task-comments', task!.id] });
      toast.success('Đã gửi phản hồi thành công!');
    },
    onError: () => toast.error('Không thể gửi bình luận. Vui lòng thử lại!')
  });

  if (!task) return null;

  const comments = Array.isArray(commentsData) ? commentsData : [];
  const currentStatus = STATUS_CONFIG[task.status] || STATUS_CONFIG.OPEN;
  const budget = Number(task.budget || 0);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText.trim());
  };

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(task.id);
      toast.success('Đã sao chép Task ID!');
    }
  };

  let formattedDeadline = '';
  if (task.deadline) {
    try {
      formattedDeadline = format(new Date(task.deadline), 'dd/MM/yyyy');
    } catch {
      formattedDeadline = '';
    }
  }

  let formattedCreated = 'Gần đây';
  if (task.createdAt) {
    try {
      formattedCreated = formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: vi });
    } catch {
      formattedCreated = 'Gần đây';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in bg-slate-900/60 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300 border-l border-slate-200 dark:border-slate-800">
        
        {/* ========================================================================= */}
        {/* HEADER BAR                                                                */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full uppercase tracking-wider truncate max-w-[200px]">
              {task.project?.title || 'Dự Án'}
            </span>
            <button
              onClick={handleCopyId}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Sao chép ID"
            >
              #{task.id?.slice(0, 8)} <Copy className="w-3 h-3" />
            </button>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SCROLLABLE BODY CONTENT                                                   */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-7 space-y-6">
          
          {/* Title & Priority & Tags */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                task.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                task.priority === 'High' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                task.priority === 'Low' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' :
                'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}>
                Ưu tiên: {task.priority || 'Moderate'}
              </span>
              <span className="text-[11px] text-slate-400">
                Tạo {formattedCreated}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-3">
              {task.title}
            </h1>

            {/* Tags rendering */}
            {(() => {
              let parsedTags: string[] = [];
              if (Array.isArray(task.tags)) {
                parsedTags = task.tags;
              } else if (typeof task.tags === 'string' && task.tags.trim()) {
                try {
                  const p = JSON.parse(task.tags);
                  parsedTags = Array.isArray(p) ? p : [task.tags];
                } catch {
                  parsedTags = task.tags.split(',').map((s: string) => s.trim()).filter(Boolean);
                }
              }
              if (parsedTags.length === 0) return null;
              return (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {parsedTags.map((tag: string, idx: number) => (
                    <span 
                      key={idx}
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-blue-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Status & Bounty Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Status Selector Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-500" /> Trạng Thái Nhiệm Vụ
              </span>
              <div className="relative">
                <select 
                  value={task.status} 
                  onChange={(e) => onStatusChange(task.id, e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl font-bold text-xs border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} outline-none cursor-pointer appearance-none`}
                >
                  <option value="OPEN">⚪ To Do (Cần làm)</option>
                  <option value="IN_PROGRESS">🔵 In Progress (Đang làm)</option>
                  <option value="REVIEW">🟡 In Review (Đang duyệt)</option>
                  <option value="DONE">🟢 Done (Hoàn thành)</option>
                </select>
              </div>
            </div>

            {/* Bounty Card */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600" /> Thù Lao Nhiệm Vụ
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {budget > 0 ? `${budget.toLocaleString()} ₫` : 'Theo tổng dự án'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Bảo chứng ký quỹ Escrow
              </span>
            </div>

          </div>

          {/* Assignee & Deadline Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Assignee */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
              <UserAvatar user={task.assignee} size="md" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Người Phụ Trách</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {task.assignee ? `${task.assignee.firstName || ''} ${task.assignee.lastName || task.assignee.email || ''}` : 'Chưa phân công'}
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hạn Hoàn Thành</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {formattedDeadline || 'Không có thời hạn cố định'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Mô Tả Chi Tiết & Đính Kèm
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'comments'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Thảo Luận ({comments.length})
            </button>
          </div>

          {/* TAB 1: DETAILS & ATTACHMENTS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nội Dung Thực Hiện & Tiêu Chuẩn Nghiệm Thu
                </h3>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {task.description || <span className="text-slate-400 italic">Không có mô tả chi tiết cho nhiệm vụ này.</span>}
                </div>
              </div>

              {/* Attachments Gallery */}
              {(() => {
                let parsedAttachments: any[] = [];
                if (Array.isArray(task.attachments)) {
                  parsedAttachments = task.attachments;
                } else if (typeof task.attachments === 'string' && task.attachments.trim()) {
                  try {
                    const p = JSON.parse(task.attachments);
                    parsedAttachments = Array.isArray(p) ? p : [p];
                  } catch {}
                }

                if (parsedAttachments.length === 0) return null;

                return (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Tệp Đính Kèm & Hình Ảnh ({parsedAttachments.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {parsedAttachments.map((att: any, idx: number) => {
                        const isImage = att.base64?.startsWith('data:image') || att.type?.startsWith('image') || att.url?.match(/\.(jpeg|jpg|gif|png|svg)$/i);
                        return (
                          <div 
                            key={att.id || idx} 
                            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex flex-col items-center text-center overflow-hidden hover:shadow-md transition-all"
                          >
                            {isImage ? (
                              <a href={att.base64 || att.url} target="_blank" rel="noreferrer" className="w-full h-24 mb-2 overflow-hidden rounded-lg block cursor-pointer">
                                <img 
                                  src={att.base64 || att.url} 
                                  alt={att.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                              </a>
                            ) : (
                              <div className="w-full h-24 mb-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center text-blue-500">
                                <FileText className="w-8 h-8" />
                              </div>
                            )}
                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full" title={att.name}>
                              {att.name || `Tệp đính kèm ${idx + 1}`}
                            </p>
                            {att.size && (
                              <p className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(0)} KB</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: COMMENTS / ACTIVITY */}
          {activeTab === 'comments' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {commentsLoading ? (
                  <div className="text-center text-slate-400 text-xs py-6">Đang tải thảo luận...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs py-8 italic bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    Chưa có bình luận nào. Hãy gửi phản hồi đầu tiên!
                  </div>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                      <UserAvatar user={comment.user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {comment.user?.firstName ? `${comment.user.firstName} ${comment.user.lastName || ''}` : comment.user?.email || 'Thành viên'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết phản hồi hoặc cập nhật tiến độ..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  disabled={commentMutation.isPending || !commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs px-4 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </Button>
              </form>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* FOOTER QUICK TRANSITION ACTIONS                                           */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-500">
            Chuyển nhanh trạng thái:
          </span>

          <div className="flex items-center gap-2">
            {task.status !== 'IN_PROGRESS' && (
              <Button
                onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-3.5"
              >
                Bắt đầu làm 🚀
              </Button>
            )}

            {task.status === 'IN_PROGRESS' && (
              <Button
                onClick={() => onStatusChange(task.id, 'REVIEW')}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl h-9 px-3.5"
              >
                Gửi Review 🔍
              </Button>
            )}

            {task.status === 'REVIEW' && (
              <Button
                onClick={() => onStatusChange(task.id, 'DONE')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-3.5"
              >
                Hoàn thành ✅
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default TaskDetailSlider;
