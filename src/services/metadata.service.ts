import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const metadataService = {
  async getSkills() {
    const res = await axios.get(`${API_URL}/metadata/skills`);
    return res.data;
  },

  async getPositions() {
    const res = await axios.get(`${API_URL}/metadata/positions`);
    return res.data;
  },
};
