import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DEFAULT_SKILLS = [
  'Reactjs', 'TypeScript', 'Nodejs', 'Solidity', 'Web3.js', 'Nextjs',
  'Python', 'Go', 'Rust', 'Docker', 'PostgreSQL', 'TailwindCSS',
  'GraphQL', 'AWS', 'Kubernetes', 'Smart Contracts', 'UI/UX', 'Figma'
];

const DEFAULT_POSITIONS = [
  'Front End', 'Back End', 'Full Stack', 'Smart Contract',
  'DeFi Engineer', 'UI/UX Design', 'DevOps', 'Mobile', 'QA / Tester', 'Project Manager'
];

export const metadataService = {
  async getSkills(): Promise<string[]> {
    try {
      const res = await axios.get(`${API_URL}/metadata/skills`, { timeout: 3000 });
      return (Array.isArray(res.data) && res.data.length > 0) ? res.data : DEFAULT_SKILLS;
    } catch {
      return DEFAULT_SKILLS;
    }
  },

  async getPositions(): Promise<string[]> {
    try {
      const res = await axios.get(`${API_URL}/metadata/positions`, { timeout: 3000 });
      return (Array.isArray(res.data) && res.data.length > 0) ? res.data : DEFAULT_POSITIONS;
    } catch {
      return DEFAULT_POSITIONS;
    }
  },

  async getBudgetRanges(): Promise<{ min: number; max: number; presets: { label: string; min: string; max: string }[] }> {
    try {
      const res = await axios.get(`${API_URL}/metadata/budget-ranges`, { timeout: 3000 });
      if (res.data && res.data.presets) {
        return res.data;
      }
      return {
        min: 0,
        max: 100000000,
        presets: [
          { label: 'Tất cả', min: '', max: '' },
          { label: '< 5 Tr', min: '0', max: '5000000' },
          { label: '5M - 20M', min: '5000000', max: '20000000' },
          { label: '20M - 50M', min: '20000000', max: '50000000' },
          { label: '> 50 Tr', min: '50000000', max: '' },
        ]
      };
    } catch {
      return {
        min: 0,
        max: 100000000,
        presets: [
          { label: 'Tất cả', min: '', max: '' },
          { label: '< 5 Tr', min: '0', max: '5000000' },
          { label: '5M - 20M', min: '5000000', max: '20000000' },
          { label: '20M - 50M', min: '20000000', max: '50000000' },
          { label: '> 50 Tr', min: '50000000', max: '' },
        ]
      };
    }
  }
};
