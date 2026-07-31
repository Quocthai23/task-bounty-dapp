import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`
  }
});

export const profileService = {
  getProfile: async () => {
    const res = await axios.get(`${API_URL}/profile/me`, getAuthHeaders());
    return res.data;
  },

  getHistory: async (startDate?: string, endDate?: string) => {
    let url = `${API_URL}/profile/history?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    const res = await axios.get(url, getAuthHeaders());
    return res.data;
  },

  updateBasicInfo: async (data: any) => {
    const res = await axios.put(`${API_URL}/profile/me`, data, getAuthHeaders());
    return res.data;
  },

  updateBio: async (bio: string) => {
    const res = await axios.put(`${API_URL}/profile/me/bio`, { bio }, getAuthHeaders());
    return res.data;
  },

  updateSocials: async (socials: any) => {
    const res = await axios.put(`${API_URL}/profile/me/socials`, { socials }, getAuthHeaders());
    return res.data;
  },

  uploadCv: async (data: { name: string, base64: string }) => {
    const res = await axios.post(`${API_URL}/profile/me/cv`, data, getAuthHeaders());
    return res.data;
  },

  deleteCv: async (cvId: string) => {
    const res = await axios.delete(`${API_URL}/profile/me/cv/${cvId}`, getAuthHeaders());
    return res.data;
  },

  setPrimaryCv: async (cvId: string) => {
    const res = await axios.put(`${API_URL}/profile/me/cv/${cvId}/primary`, {}, getAuthHeaders());
    return res.data;
  }
};
