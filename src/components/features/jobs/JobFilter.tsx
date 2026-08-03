import React from 'react';
import { Slider } from '@/components/shared/atoms/slider';
import { 
  Filter, 
  RotateCcw, 
  Search, 
  Sparkles, 
  DollarSign, 
  Code2, 
  Briefcase, 
  Check, 
  ShieldCheck 
} from 'lucide-react';

interface JobFilterProps {
  positions: string[];
  skills: string[];
  selectedPosition: string;
  setSelectedPosition: (pos: string) => void;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  escrowOnly?: boolean;
  setEscrowOnly?: (val: boolean) => void;
}

const POSITION_ICONS: Record<string, string> = {
  'Front End': '💻',
  'Back End': '⚙️',
  'Full Stack': '⚡',
  'Smart Contract': '⛓️',
  'DeFi Engineer': '🪙',
  'UI/UX Design': '🎨',
  'Design': '🎨',
  'DevOps': '🚀',
  'Mobile': '📱',
  'QA / Tester': '🧪',
  'QA': '🧪',
  'Project Manager': '📋',
  'Database': '🗄️'
};

const BUDGET_PRESETS = [
  { label: 'Tất cả', min: '', max: '' },
  { label: '< 5 Tr', min: '0', max: '5000000' },
  { label: '5M - 20M', min: '5000000', max: '20000000' },
  { label: '20M - 50M', min: '20000000', max: '50000000' },
  { label: '> 50 Tr', min: '50000000', max: '' },
];

export const JobFilter: React.FC<JobFilterProps> = ({
  positions = [],
  skills = [],
  selectedPosition,
  setSelectedPosition,
  selectedSkills,
  setSelectedSkills,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  escrowOnly = false,
  setEscrowOnly
}) => {
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleReset = () => {
    setSelectedPosition('');
    setSelectedSkills([]);
    setMinPrice('');
    setMaxPrice('');
    if (setEscrowOnly) setEscrowOnly(false);
  };

  const hasActiveFilters = Boolean(
    selectedPosition || 
    selectedSkills.length > 0 || 
    minPrice || 
    maxPrice || 
    escrowOnly
  );

  return (
    <div className="bg-slate-50/80 dark:bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
      
      {/* Header & Reset Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Bộ Lọc Nhiệm Vụ</h3>
            <p className="text-[11px] text-slate-400">Tìm kiếm cơ hội phù hợp</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Đặt lại toàn bộ bộ lọc"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Escrow Only Switch */}
      {setEscrowOnly && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Đã Ký Quỹ Escrow</div>
              <div className="text-[10px] text-slate-400">Chỉ việc đã bảo chứng tiền</div>
            </div>
          </div>
          <button
            onClick={() => setEscrowOnly(!escrowOnly)}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
              escrowOnly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div 
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                escrowOnly ? 'left-5' : 'left-1'
              }`}
            />
          </button>
        </div>
      )}

      {/* Positions / Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Vị Trí / Chuyên Môn
          </h4>
          {selectedPosition && (
            <button 
              onClick={() => setSelectedPosition('')}
              className="text-[11px] text-blue-600 hover:underline font-bold"
            >
              Xem tất cả
            </button>
          )}
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {positions.map(pos => {
            const isSelected = selectedPosition === pos;
            const icon = POSITION_ICONS[pos] || '💼';
            return (
              <button
                key={pos}
                onClick={() => setSelectedPosition(isSelected ? '' : pos)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span>{pos}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price / Bounty Range */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Ngân Sách Bounty (VND)
        </h4>

        {/* Quick Presets */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {BUDGET_PRESETS.map((preset) => {
            const isActive = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                onClick={() => {
                  setMinPrice(preset.min);
                  setMaxPrice(preset.max);
                }}
                className={`px-2 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer text-center ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Slider */}
        <div className="px-2 mb-4">
          <Slider 
            min={0}
            max={100000000}
            step={1000000}
            value={[minPrice ? parseInt(minPrice) : 0, maxPrice ? parseInt(maxPrice) : 100000000]}
            onValueChange={(val) => {
              setMinPrice(val[0].toString());
              setMaxPrice(val[1].toString());
            }}
          />
        </div>

        {/* Min/Max Input Boxes */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input 
              type="number" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Từ 0 ₫"
              className="w-full text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center focus:outline-none focus:border-blue-500 transition-colors" 
            />
            <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 font-bold">VND</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Đến Tối đa"
              className="w-full text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center focus:outline-none focus:border-blue-500 transition-colors" 
            />
            <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 font-bold">VND</span>
          </div>
        </div>
      </div>

      {/* Popular Skills Tag Cloud */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-purple-500" /> Kỹ Năng Yêu Cầu ({selectedSkills.length})
          </h4>
          {selectedSkills.length > 0 && (
            <button 
              onClick={() => setSelectedSkills([])}
              className="text-[11px] text-rose-500 hover:underline font-bold"
            >
              Xóa chọn
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {skills.map(skill => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <span>{skill}</span>
                {isSelected && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};
export default JobFilter;
