import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { metadataService } from '@/services/metadata.service';
import { 
  Dialog, 
  DialogContent 
} from '@/components/shared/atoms/dialog';
import { Button } from '@/components/shared/atoms/button';
import { 
  X, 
  Plus, 
  Trash2,
  Lock,
  Globe,
  Mail,
  Calendar,
  Layers,
  DollarSign,
  Users,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const DEFAULT_POPULAR_SKILLS = [
  'React', 'TypeScript', 'Solidity', 'Node.js', 'Next.js', 
  'Smart Contract', 'Rust', 'TailwindCSS', 'Python', 'Web3.js', 'UI/UX'
];

const PRESET_BUDGETS = [500, 1000, 2500, 5000, 10000];

const SAMPLE_TITLES = [
  'Xây dựng sàn DApp DeFi',
  'Lập trình Smart Contract Staking',
  'Hệ thống Thanh toán Fiat Bridge',
  'Thiết kế Giao diện Web3 DApp'
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { data: dynamicSkills } = useQuery({
    queryKey: ['metadata-skills'],
    queryFn: () => metadataService.getSkills(),
  });

  const availableSkills = (dynamicSkills && dynamicSkills.length > 0) ? dynamicSkills : DEFAULT_POPULAR_SKILLS;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(1000);
  const [currency, setCurrency] = useState<'USD' | 'USDT' | 'VNDT'>('USD');
  const [type, setType] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [maxMembers, setMaxMembers] = useState<number>(5);
  const [isRecruiting, setIsRecruiting] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'TypeScript', 'Solidity']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const clean = customSkillInput.trim();
    if (!clean) return;
    if (!selectedSkills.includes(clean)) {
      setSelectedSkills([...selectedSkills, clean]);
    }
    setCustomSkillInput('');
  };

  const handleAddEmail = () => {
    const clean = emailInput.trim().toLowerCase();
    if (!clean) return;
    if (!clean.includes('@') || !clean.includes('.')) {
      toast.error('Vui lòng nhập định dạng email hợp lệ');
      return;
    }
    if (emails.includes(clean)) {
      toast.error('Email này đã có trong danh sách');
      return;
    }
    setEmails([...emails, clean]);
    setEmailInput('');
  };

  const handleRemoveEmail = (em: string) => {
    setEmails(emails.filter(e => e !== em));
  };

  const handleSetDeadlineDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDeadline(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề dự án');
      return;
    }
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả dự án');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget) || 0,
        currency,
        type,
        maxMembers: Number(maxMembers) || 5,
        isRecruiting,
        skillsRequired: JSON.stringify(selectedSkills),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        initialMemberEmails: emails.length > 0 ? emails : undefined,
      };

      await onSubmit(payload);

      toast.success('Khởi tạo dự án thành công!');
      onClose();

      // Reset
      setTitle('');
      setDescription('');
      setBudget(1000);
      setCurrency('USD');
      setType('PUBLIC');
      setMaxMembers(5);
      setIsRecruiting(true);
      setSelectedSkills(['React', 'TypeScript', 'Solidity']);
      setDeadline('');
      setEmails([]);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message;
      if (Array.isArray(errorMsg)) {
        toast.error(errorMsg.join(' • '));
      } else {
        toast.error(errorMsg || 'Không thể tạo dự án. Vui lòng kiểm tra lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false}
        className="!max-w-5xl sm:!max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto custom-scrollbar p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100"
      >
        {/* Clean Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Tạo Dự Án / Tuyển Dụng Mới
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Thiết lập thông tin dự án, ngân sách bảo chứng và phân quyền thành viên
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Spacious 2 Columns */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: Main Info (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên Dự Án / Vị Trí Tuyển Dụng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Xây dựng Hệ thống Thanh toán Fiat-Crypto Bridge"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-medium"
                  required
                />

                {/* Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 font-medium">Gợi ý:</span>
                  {SAMPLE_TITLES.map((t, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setTitle(t)}
                      className="text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded-md transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô Tả Mục Tiêu & Yêu Cầu Dự Án <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Mô tả chi tiết mục tiêu dự án, sản phẩm đầu ra, kiến trúc kỹ thuật hoặc tiêu chuẩn nghiệm thu nhiệm vụ..."
                  className="w-full p-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all leading-relaxed"
                  required
                />
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Kỹ Năng Yêu Cầu (Tech Stack)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                  {availableSkills.map((skill: string) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => handleToggleSkill(skill)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                    placeholder="Thêm kỹ năng khác (Enter để thêm)..."
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomSkill}
                    variant="neutral-outline"
                    className="rounded-xl text-xs px-3 py-1.5"
                  >
                    Thêm
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Settings & Parameters (5 cols) */}
            <div className="lg:col-span-5 space-y-5 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {/* Budget & Currency */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Ngân Sách Bảo Chứng Dự Án
                </label>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e: any) => setCurrency(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="USDT">USDT (₮)</option>
                    <option value="VNDT">VNDT (₫)</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                      placeholder="1000"
                      required
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRESET_BUDGETS.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setBudget(val)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border transition-colors ${
                        budget === val
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      ${val.toLocaleString()}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1.5">
                  Khóa cố định khi có ứng viên apply nhằm đảm bảo minh bạch.
                </span>
              </div>

              {/* Max Members Stepper */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Số Lượng Thành Viên Tối Đa
                </label>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMaxMembers(Math.max(1, maxMembers - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-bold text-sm">
                    {maxMembers} <span className="text-xs font-normal text-slate-500">thành viên</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaxMembers(maxMembers + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Chế Độ Dự Án
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('PUBLIC')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      type === 'PUBLIC'
                        ? 'bg-white dark:bg-slate-800 border-slate-900 dark:border-white shadow-sm'
                        : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Public
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Mở tuyển ngoài cộng đồng</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('PRIVATE')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      type === 'PRIVATE'
                        ? 'bg-white dark:bg-slate-800 border-slate-900 dark:border-white shadow-sm'
                        : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Private
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Chỉ mời qua email</div>
                  </button>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Hạn Chót Hoàn Thành (Deadline)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[7, 14, 30].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => handleSetDeadlineDays(d)}
                      className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    >
                      +{d} ngày
                    </button>
                  ))}
                  {deadline && (
                    <button
                      type="button"
                      onClick={() => setDeadline('')}
                      className="text-[10px] font-medium text-rose-500 hover:underline ml-auto"
                    >
                      Xóa hạn
                    </button>
                  )}
                </div>
              </div>

              {/* Invite via Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Gán Email Thành Viên (Tùy chọn)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                    placeholder="user@example.com"
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                  <Button
                    type="button"
                    onClick={handleAddEmail}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs px-3"
                  >
                    Thêm
                  </Button>
                </div>

                {emails.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {emails.map((em) => (
                      <span
                        key={em}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-[11px]"
                      >
                        {em}
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(em)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="neutral-outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold px-5 py-2.5"
            >
              Hủy Bỏ
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold text-xs px-7 py-2.5 rounded-xl shadow-sm transition-all"
            >
              {isSubmitting ? 'Đang Khởi Tạo...' : 'Khởi Tạo Dự Án'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
