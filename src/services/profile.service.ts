import { api } from './api';

export const profileService = {
  getProfile: async () => {
    const res = await api.get('/profile/me');
    return res.data;
  },

  getHistory: async (startDate?: string, endDate?: string) => {
    let url = '/profile/history?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    const res = await api.get(url);
    return res.data;
  },

  updateBasicInfo: async (data: any) => {
    const res = await api.put('/profile/me', data);
    return res.data;
  },

  updateBio: async (bio: string) => {
    const res = await api.put('/profile/me/bio', { bio });
    return res.data;
  },

  updateSocials: async (socials: any) => {
    const res = await api.put('/profile/me/socials', { socials });
    return res.data;
  },

  uploadCv: async (data: { name: string, base64: string }) => {
    const res = await api.post('/profile/me/cv', data);
    return res.data;
  },

  deleteCv: async (cvId: string) => {
    const res = await api.delete(`/profile/me/cv/${cvId}`);
    return res.data;
  },

  setPrimaryCv: async (cvId: string) => {
    const res = await api.put(`/profile/me/cv/${cvId}/primary`, {});
    return res.data;
  }
};
