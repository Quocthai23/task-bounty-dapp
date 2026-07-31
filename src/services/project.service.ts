import { api } from './api';

export const projectService = {
  getProjects: async (params?: any) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  getJoinedProjects: async () => {
    const response = await api.get('/projects/joined');
    return response.data;
  },
  getOwnedProjects: async () => {
    const response = await api.get('/projects/owned');
    return response.data;
  },
  createProject: async (data: any) => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  getProjectById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  updateProject: async (id: string, data: any) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  applyForProject: async (id: string, data: any) => {
    const response = await api.post(`/projects/${id}/applications`, data);
    return response.data;
  },
  getApplications: async (id: string) => {
    const response = await api.get(`/projects/${id}/applications`);
    return response.data;
  },
  updateApplicationStatus: async (id: string, appId: string, status: string) => {
    const response = await api.put(`/projects/${id}/applications/${appId}`, { status });
    return response.data;
  },
  addProjectMember: async (id: string, data: any) => {
    const response = await api.post(`/projects/${id}/members`, data);
    return response.data;
  }
};
