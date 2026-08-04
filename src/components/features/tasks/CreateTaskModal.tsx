import React, { useState, useRef, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { Button } from '@/components/shared/atoms/button';
import { 
  Plus, 
  X, 
  Coins, 
  Calendar, 
  Tag, 
  AlertCircle, 
  UploadCloud, 
  Trash2, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  User as UserIcon,
  Flag,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { TaskAttachment } from '@/types/api.types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: any;
  projectId?: string;
  projectTitle?: string;
  projectBudget?: number;
  projectCurrency?: string;
  tasks?: any[];
  existingTasks?: any[];
  members?: any[];
  onSuccess?: () => void;
}

const PRESET_TAGS = [
  'Frontend',
  'Backend',
  'UI/UX',
  'Smart Contract',
  'Bug Fix',
  'Feature',
  'API',
  'Testing',
  'Security',
  'DevOps'
];

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Thấp (Low)', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
  { value: 'Moderate', label: 'Trung bình (Moderate)', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { value: 'High', label: 'Cao (High)', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { value: 'Urgent', label: 'Khẩn cấp (Urgent)', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  project,
  projectId: propProjectId,
  projectTitle: propProjectTitle,
  projectBudget: propProjectBudget,
  projectCurrency: propProjectCurrency,
  tasks: propTasks,
  existingTasks: propExistingTasks,
  members: propMembers,
  onSuccess
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectId = project?.id || propProjectId || '';
  const projectTitle = project?.title || propProjectTitle || 'Dự án';
  const projectBudget = project?.budget ?? propProjectBudget ?? 0;
  const projectCurrency = project?.currency || propProjectCurrency || 'VND';
  const existingTasks = project?.tasks || propTasks || propExistingTasks || [];
  const members = project?.members || propMembers || [];

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [priority, setPriority] = useState<string>('Moderate');
  const [deadline, setDeadline] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Calculate Project Escrow Pool
  const allocatedBudget = useMemo(() => {
    return existingTasks.reduce((sum: number, task: any) => sum + (Number(task.budget) || 0), 0);
  }, [existingTasks]);

  const remainingEscrow = useMemo(() => {
    return Math.max(0, projectBudget - allocatedBudget);
  }, [projectBudget, allocatedBudget]);

  const enteredBudget = Number(budget) || 0;
  const isBudgetOverPool = enteredBudget > remainingEscrow;
  const allocationPercent = projectBudget > 0 
    ? Math.min(100, Math.round(((allocatedBudget + enteredBudget) / projectBudget) * 100))
    : 0;

  // Handle Tag Toggle
  const togglePresetTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTag.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Handle File & Image Attachments (Base64 encoding compatible with CV storage pattern)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: TaskAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Tệp "${file.name}" vượt quá giới hạn 5MB!`);
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          base64,
          size: file.size,
          type: file.type || 'image/png'
        });
      } catch (err) {
        toast.error(`Không thể xử lý tệp "${file.name}"`);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Set Quick Deadline
  const handleQuickDeadline = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    // Format to datetime-local input YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = '23';
    const minutes = '59';
    setDeadline(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  // Mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => taskService.createTask(projectId, data),
    onSuccess: () => {
      toast.success(t('manageJobDetail.toastCreateTaskSuccess', 'Đã tạo nhiệm vụ mới thành công!'));
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects-owned'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('manageJobDetail.toastCreateTaskError', 'Không thể tạo nhiệm vụ'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t('manageJobDetail.toastTaskTitleValidation', 'Vui lòng nhập tiêu đề nhiệm vụ!'));
      return;
    }

    if (isBudgetOverPool) {
      toast.error(`Ngân sách nhiệm vụ (${enteredBudget.toLocaleString()} ${projectCurrency}) vượt quá số dư bảo chứng còn lại (${remainingEscrow.toLocaleString()} ${projectCurrency})!`);
      return;
    }

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim() || 'Chưa có mô tả chi tiết.',
      budget: enteredBudget,
      priority,
      tags,
      attachments,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      assigneeId: assigneeId || undefined,
      status: 'OPEN'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Tạo Nhiệm Vụ Mới (New Task)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Dự án: <span className="font-bold text-slate-700 dark:text-slate-300">{projectTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ESCROW BUDGET POOL LIVE VISUALIZER */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Quỹ Bảo Chứng Escrow Dự Án
            </span>
            <span className="text-slate-900 dark:text-white font-black">
              {projectBudget.toLocaleString()} {projectCurrency}
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${projectBudget > 0 ? (allocatedBudget / projectBudget) * 100 : 0}%` }} 
              className="bg-blue-600 transition-all duration-300"
              title={`Đã phân bổ: ${allocatedBudget.toLocaleString()}`}
            />
            <div 
              style={{ width: `${projectBudget > 0 ? (enteredBudget / projectBudget) * 100 : 0}%` }} 
              className={`${isBudgetOverPool ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'} transition-all duration-300`}
              title={`Task hiện tại: ${enteredBudget.toLocaleString()}`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-400 font-medium">Đã giao ({existingTasks.length} task)</p>
              <p className="font-bold text-blue-600 dark:text-blue-400">{allocatedBudget.toLocaleString()} {projectCurrency}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-400 font-medium">Khả dụng còn lại</p>
              <p className={`font-bold ${remainingEscrow > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                {remainingEscrow.toLocaleString()} {projectCurrency}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-400 font-medium">Tỷ lệ sử dụng</p>
              <p className={`font-bold ${isBudgetOverPool ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                {allocationPercent}%
              </p>
            </div>
          </div>

          {isBudgetOverPool && (
            <div className="flex items-center gap-2 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Ngân sách task vượt quá số dư bảo chứng còn lại! Vui lòng giảm số tiền hoặc nạp thêm quỹ vào dự án.</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề nhiệm vụ (Task Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Thiết kế giao diện Dashboard, Tích hợp API thanh toán..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Row: Budget & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kinh phí nhiệm vụ (Bounty) ({projectCurrency})
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  max={remainingEscrow}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={`Tối đa: ${remainingEscrow.toLocaleString()}`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mức độ ưu tiên (Priority)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Assignee & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Giao việc cho (Assignee)
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Chưa chỉ định (Để công khai cho ứng viên)</option>
                {members.map((m: any) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.firstName || m.user?.email} ({m.role || 'MEMBER'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hạn hoàn thành (Deadline)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDeadline(3)}
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded hover:bg-blue-100 cursor-pointer"
                  >
                    +3 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDeadline(7)}
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded hover:bg-blue-100 cursor-pointer"
                  >
                    +1 tuần
                  </button>
                </div>
              </div>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-500" /> Gắn Thẻ / Nhãn (Tags)
            </label>
            
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_TAGS.map(t => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => togglePresetTag(t)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(e); } }}
                placeholder="Nhập thẻ tùy chỉnh rồi bấm Thêm..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors cursor-pointer"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mô tả chi tiết yêu cầu
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể các tiêu chuẩn nghiệm thu, tài liệu tham khảo, API endpoint hoặc công nghệ yêu cầu..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* IMAGE & ATTACHMENT UPLOAD */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Hình ảnh / Tệp đính kèm (Attachments)
              </label>
              <span className="text-[10px] text-slate-400">Tối đa 5MB / tệp (PNG, JPG, PDF, SVG)</span>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <UploadCloud className="w-6 h-6 mx-auto text-slate-400 mb-1" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nhấn để tải lên hoặc kéo thả hình ảnh mô tả
              </p>
              <p className="text-[11px] text-slate-400">Hỗ trợ ảnh mockup UI, thiết kế Figma, tài liệu đặc tả</p>
            </div>

            {/* Attachments Preview Grid */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                {attachments.map(att => (
                  <div 
                    key={att.id} 
                    className="relative group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center gap-2 overflow-hidden shadow-xs"
                  >
                    {att.base64?.startsWith('data:image') ? (
                      <img 
                        src={att.base64} 
                        alt={att.name} 
                        className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-100 dark:border-slate-700" 
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{att.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {att.size ? `${(att.size / 1024).toFixed(0)} KB` : 'Đính kèm'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Xóa tệp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending || isBudgetOverPool || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {createTaskMutation.isPending ? 'Đang tạo...' : 'Tạo Nhiệm Vụ Ngay'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
