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
  Percent,
  ChevronRight,
  ChevronLeft,
  Lock,
  ListTodo,
  CheckSquare,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { TaskAttachment } from '@/types/api.types';

interface SubtaskItem {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
}

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
  availableProjects?: any[];
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
  availableProjects,
  onSuccess
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard Step State (1: Info, 2: Escrow & Budget, 3: Assignee & Subtasks)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Dynamic Project Selection if availableProjects is provided
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      if (propProjectId) {
        setSelectedProjectId(propProjectId);
      } else if (project?.id) {
        setSelectedProjectId(project.id);
      } else if (availableProjects && availableProjects.length > 0) {
        setSelectedProjectId(availableProjects[0].id);
      }
    }
  }, [isOpen, propProjectId, project, availableProjects]);

  const activeProject = useMemo(() => {
    if (availableProjects && availableProjects.length > 0) {
      return availableProjects.find((p: any) => p.id === (selectedProjectId || propProjectId)) || availableProjects[0];
    }
    return project;
  }, [availableProjects, selectedProjectId, propProjectId, project]);

  const projectId = activeProject?.id || selectedProjectId || propProjectId || project?.id || '';
  const projectTitle = activeProject?.title || project?.title || propProjectTitle || 'Dự án';
  const projectBudget = activeProject?.budget ?? project?.budget ?? propProjectBudget ?? 0;
  const projectCurrency = activeProject?.currency || project?.currency || propProjectCurrency || 'VND';
  const existingTasks = activeProject?.tasks || project?.tasks || propTasks || propExistingTasks || [];
  const members = activeProject?.members || project?.members || propMembers || [];

  // Step 1: Info & Specifications
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('Moderate');
  const [deadline, setDeadline] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Step 2: Budget & Escrow
  const [budget, setBudget] = useState<string>('');
  const [autoLockEscrow, setAutoLockEscrow] = useState<boolean>(true);

  // Step 3: Assignment & Subtasks Checklist
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDesc, setNewSubtaskDesc] = useState('');
  const [newSubtaskDeadline, setNewSubtaskDeadline] = useState('');

  // Calculate Project Escrow Pool
  const allocatedBudget = useMemo(() => {
    return existingTasks.reduce((sum: number, task: any) => sum + (Number(task.budget) || 0), 0);
  }, [existingTasks]);

  const remainingPool = useMemo(() => {
    return Math.max(0, projectBudget - allocatedBudget);
  }, [projectBudget, allocatedBudget]);

  const currentTaskBudgetNum = Number(budget) || 0;
  const newAllocatedTotal = allocatedBudget + currentTaskBudgetNum;
  const isBudgetOverPool = projectBudget > 0 && currentTaskBudgetNum > remainingPool;

  const budgetUsagePercent = useMemo(() => {
    if (!projectBudget || projectBudget <= 0) return 0;
    return Math.min(100, Math.round((newAllocatedTotal / projectBudget) * 100));
  }, [projectBudget, newAllocatedTotal]);

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => taskService.createTask(projectId, data),
    onSuccess: () => {
      toast.success('🎉 Đã khởi tạo nhiệm vụ thành công!');
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['manage-project-detail', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['joined-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['owned-projects'] });
      queryClient.invalidateQueries({ queryKey: ['joined-projects'] });
      handleReset();
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo nhiệm vụ');
    }
  });

  const handleReset = () => {
    setCurrentStep(1);
    setTitle('');
    setDescription('');
    setBudget('');
    setPriority('Moderate');
    setDeadline('');
    setAssigneeId('');
    setTags([]);
    setCustomTag('');
    setAttachments([]);
    setAutoLockEscrow(true);
    setSubtasks([]);
    setNewSubtaskTitle('');
    setNewSubtaskDesc('');
    setNewSubtaskDeadline('');
  };

  // Tag Management
  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      if (tags.length >= 6) {
        toast.warning('Tối đa 6 thẻ phân loại cho mỗi nhiệm vụ');
        return;
      }
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = customTag.trim();
    if (!cleanTag) return;
    if (tags.includes(cleanTag)) {
      toast.warning('Thẻ này đã được thêm');
      return;
    }
    if (tags.length >= 6) {
      toast.warning('Tối đa 6 thẻ phân loại');
      return;
    }
    setTags([...tags, cleanTag]);
    setCustomTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Subtask Management
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) {
      toast.error('Vui lòng nhập tên công việc con');
      return;
    }
    const item: SubtaskItem = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      description: newSubtaskDesc.trim() || undefined,
      deadline: newSubtaskDeadline || undefined,
    };
    setSubtasks([...subtasks, item]);
    setNewSubtaskTitle('');
    setNewSubtaskDesc('');
    setNewSubtaskDeadline('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  // File Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 5) {
      toast.warning('Tối đa 5 tệp đính kèm');
      return;
    }

    setIsUploading(true);
    const newAttachments: TaskAttachment[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Tệp "${file.name}" vượt quá dung lượng 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newAttachments.push({
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          base64: reader.result as string,
        });

        if (newAttachments.length === files.length) {
          setAttachments(prev => [...prev, ...newAttachments]);
          setIsUploading(false);
          toast.success(`Đã thêm ${newAttachments.length} tệp đính kèm`);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  // Step Validation & Navigation
  const validateStep1 = () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề nhiệm vụ');
      return false;
    }
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả chi tiết yêu cầu nhiệm vụ');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!budget || Number(budget) <= 0) {
      toast.error('Vui lòng nhập thù lao hợp lệ (> 0)');
      return false;
    }
    if (isBudgetOverPool) {
      toast.error('Thù lao vượt quá hạn mức ngân sách còn lại của dự án!');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const handlePrev = () => {
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      budget: Number(budget),
      priority,
      tags,
      attachments,
      autoLockEscrow,
      subtasks: subtasks.map(s => ({
        title: s.title,
        description: s.description || s.title,
        deadline: s.deadline || undefined,
      }))
    };

    if (deadline) payload.deadline = new Date(deadline).toISOString();
    if (assigneeId) payload.assigneeId = assigneeId;

    createTaskMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Tạo Nhiệm Vụ Mới (Multi-Step Wizard)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dự án: <span className="font-bold text-slate-700 dark:text-slate-300">{projectTitle}</span>
            </p>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Progress Bar */}
        <div className="px-6 py-3.5 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-[10px]">1</span>
              <span>📋 Thông Tin</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-400" />

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => { if (validateStep1()) setCurrentStep(2); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-[10px]">2</span>
              <span>💰 Ký Quỹ & Escrow</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-400" />

            {/* Step 3 Pill */}
            <button
              type="button"
              onClick={() => { if (validateStep1() && validateStep2()) setCurrentStep(3); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentStep === 3
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-[10px]">3</span>
              <span>👥 Phân Công & Subtasks</span>
            </button>
          </div>

          <div className="hidden sm:block text-xs font-bold text-slate-500">
            Bước {currentStep} / 3
          </div>
        </div>

        {/* Wizard Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* ================= STEP 1: BASIC INFO & SPECIFICATIONS ================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Optional Project Selector (when availableProjects is provided) */}
              {availableProjects && availableProjects.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Chọn Job / Dự án <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {availableProjects.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.title} {p.companyName ? `(${p.companyName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tiêu đề nhiệm vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Thiết kế giao diện Dashboard Admin, Tích hợp API Fiat-Bridge..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Priority & Deadline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-amber-500" /> Mức độ ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Hạn chót hoàn thành (Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-500" /> Thẻ phân loại (Tags)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_TAGS.map((tag) => {
                    const isSelected = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>

                {/* Custom tag input */}
                <div className="flex gap-2">
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô tả chi tiết yêu cầu <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả cụ thể các tiêu chuẩn nghiệm thu, công nghệ sử dụng, tài liệu tham khảo..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              {/* Attachments Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Tệp đính kèm & Mockup
                  </label>
                  <span className="text-[10px] text-slate-400">Tối đa 5MB (PNG, JPG, PDF)</span>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-3.5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nhấn để tải lên hoặc kéo thả tệp đính kèm
                  </p>
                </div>

                {/* Attachments Preview Grid */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2.5">
                    {attachments.map(att => (
                      <div 
                        key={att.id} 
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center gap-2 overflow-hidden shadow-xs"
                      >
                        {att.base64?.startsWith('data:image') ? (
                          <img 
                            src={att.base64} 
                            alt={att.name} 
                            className="w-8 h-8 object-cover rounded-lg shrink-0 border border-slate-100 dark:border-slate-700" 
                          />
                        ) : (
                          <FileText className="w-7 h-7 text-blue-500 shrink-0" />
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
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: BUDGET & ON-CHAIN ESCROW ================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Task Budget Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-500" /> Thù lao nhiệm vụ (Task Budget) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="500"
                    className="w-full pl-8 pr-16 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-black text-base text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                    {projectCurrency}
                  </span>
                </div>
              </div>

              {/* Budget Pool Bar & Indicators */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Tiến trình phân bổ ngân sách dự án:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {budgetUsagePercent}% tổng quỹ
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  {/* Already Allocated */}
                  <div 
                    style={{ width: `${Math.min(100, (allocatedBudget / (projectBudget || 1)) * 100)}%` }} 
                    className="h-full bg-slate-400 dark:bg-slate-500"
                    title="Đã phân bổ các task khác"
                  />
                  {/* Current Task */}
                  <div 
                    style={{ width: `${Math.min(100 - (allocatedBudget / (projectBudget || 1)) * 100, (currentTaskBudgetNum / (projectBudget || 1)) * 100)}%` }} 
                    className={`h-full ${isBudgetOverPool ? 'bg-rose-500' : 'bg-blue-600'}`}
                    title="Nhiệm vụ này"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Tổng Quỹ Job</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      ${projectBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Đã Gán Trước</span>
                    <span className="font-bold text-xs text-slate-500">
                      ${allocatedBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Hạn Mức Còn Lại</span>
                    <span className={`font-bold text-xs ${remainingPool > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                      ${remainingPool.toLocaleString()}
                    </span>
                  </div>
                </div>

                {isBudgetOverPool && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Thù lao vượt quá số dư còn lại (${remainingPool.toLocaleString()} {projectCurrency}). Vui lòng nạp thêm quỹ bảo chứng cho Job!</span>
                  </div>
                )}
              </div>

              {/* Automatic Blockchain Escrow Option */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Tự động khóa quỹ On-Chain (Auto-Lock Escrow)
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-md">
                          Khuyên dùng
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        Tự động chuyển số tiền thù lao này sang ví Fiat-Bridge Escrow on-chain ngay khi tạo nhiệm vụ. Đảm bảo Dev an tâm bắt đầu công việc!
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input 
                      type="checkbox" 
                      checked={autoLockEscrow} 
                      onChange={(e) => setAutoLockEscrow(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: ASSIGNEE & SUBTASKS CHECKLIST ================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Assignee Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-blue-500" /> Chỉ định thành viên thực hiện (Assignee)
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Mở tự do cho thành viên nhận (Unassigned) --</option>
                  {members.map((member: any) => {
                    const u = member.user || {};
                    const name = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email || 'Thành viên';
                    return (
                      <option key={u.id || member.id} value={u.id || member.id}>
                        {name} ({member.role || 'Member'}) - {u.email}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Nếu để trống, các thành viên trong dự án có thể bấm nhận nhiệm vụ khi bắt đầu.
                </p>
              </div>

              {/* Subtasks / Checklist Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-purple-500" /> Danh sách nhiệm vụ con / Checklist ({subtasks.length})
                  </label>
                  <span className="text-[10px] text-slate-400">Chia nhỏ các đầu việc cụ thể</span>
                </div>

                {/* Subtask Input Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Tên đầu việc con (Ví dụ: Xây dựng UI form, Viết Unit test...)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newSubtaskDesc}
                      onChange={(e) => setNewSubtaskDesc(e.target.value)}
                      placeholder="Mô tả tiêu chí đầu việc con (tùy chọn)..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />

                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm đầu việc
                    </button>
                  </div>
                </div>

                {/* Subtasks List */}
                {subtasks.length > 0 && (
                  <div className="space-y-2">
                    {subtasks.map((sub, idx) => (
                      <div
                        key={sub.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {sub.title}
                            </p>
                            {sub.description && (
                              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                                {sub.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(sub.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-800/60 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tóm tắt nhiệm vụ trước khi khởi tạo:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  <div>• Tiêu đề: <span className="font-bold text-slate-900 dark:text-white">{title}</span></div>
                  <div>• Thù lao: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${budget} {projectCurrency}</span></div>
                  <div>• Ưu tiên: <span className="font-bold">{priority}</span></div>
                  <div>• Tự động Escrow: <span className="font-bold text-blue-600 dark:text-blue-400">{autoLockEscrow ? 'Bật (Đã kích hoạt)' : 'Tắt'}</span></div>
                  <div>• Số nhiệm vụ con: <span className="font-bold text-purple-600 dark:text-purple-400">{subtasks.length} đầu việc</span></div>
                  <div>• Tệp đính kèm: <span className="font-bold">{attachments.length} tệp</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODAL FOOTER CONTROLS ================= */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                className="text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => { handleReset(); onClose(); }}
                className="text-xs text-slate-500 cursor-pointer"
              >
                Hủy bỏ
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Tiếp tục <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createTaskMutation.isPending || isBudgetOverPool || isUploading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                {createTaskMutation.isPending ? 'Đang khởi tạo...' : '🚀 Khởi Tạo Nhiệm Vụ Ngay'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
