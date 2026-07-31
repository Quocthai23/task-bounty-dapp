import React from 'react';
import { Slider } from '@/components/shared/atoms/slider';

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
}

export const JobFilter: React.FC<JobFilterProps> = ({
  positions,
  skills,
  selectedPosition,
  setSelectedPosition,
  selectedSkills,
  setSelectedSkills,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice
}) => {
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200/60">
      <h3 className="text-xl font-black mb-6 text-neutral-900">Filter Jobs</h3>
      
      {/* Positions */}
      <div className="mb-8">
        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Positions</h4>
        <div className="space-y-3">
          {positions.length === 0 && <p className="text-sm text-neutral-400">Loading positions...</p>}
          {positions.map(pos => (
            <label key={pos} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                <input 
                  type="radio" 
                  name="position" 
                  checked={selectedPosition === pos}
                  onChange={() => setSelectedPosition(pos)}
                  className="peer appearance-none w-5 h-5 border-2 border-neutral-300 rounded-full checked:border-primary-500 transition-colors cursor-pointer"
                />
                {selectedPosition === pos && (
                  <div className="absolute w-2.5 h-2.5 bg-primary-500 rounded-full pointer-events-none"></div>
                )}
              </div>
              <span className={`text-sm font-semibold transition-colors ${selectedPosition === pos ? 'text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-900'}`}>
                {pos}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Price Range (VND)</h4>
        <div className="px-2 mb-6 mt-4">
          <Slider 
            min={0}
            max={200000000}
            step={1000000}
            value={[minPrice ? parseInt(minPrice) : 0, maxPrice ? parseInt(maxPrice) : 200000000]}
            onValueChange={(val) => {
              setMinPrice(val[0].toString());
              setMaxPrice(val[1].toString());
            }}
          />
        </div>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={minPrice} 
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-1/2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg p-2 text-center focus:outline-none focus:border-primary-500 transition-colors" 
          />
          <input 
            type="number" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-1/2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg p-2 text-center focus:outline-none focus:border-primary-500 transition-colors" 
          />
        </div>
      </div>

      <div className="border-t border-neutral-200/60 my-6"></div>

      {/* Popular Skills */}
      <div>
        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Popular Skills</h4>
        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          {skills.length === 0 && <p className="text-sm text-neutral-400">Loading skills...</p>}
          {skills.map(skill => (
            <label key={skill} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                <input 
                  type="checkbox" 
                  checked={selectedSkills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  className="peer appearance-none w-5 h-5 border-2 border-neutral-300 rounded md:checked:bg-primary-500 md:checked:border-primary-500 transition-colors cursor-pointer"
                />
                {selectedSkills.includes(skill) && (
                  <svg className="absolute w-3 h-3 text-white pointer-events-none" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7L5 11L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={`text-sm font-semibold truncate transition-colors ${selectedSkills.includes(skill) ? 'text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-900'}`}>
                {skill}
              </span>
            </label>
          ))}
        </div>
      </div>
      
    </div>
  );
};
