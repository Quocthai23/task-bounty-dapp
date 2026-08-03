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
};
