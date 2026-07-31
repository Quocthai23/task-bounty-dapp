import { api } from './api';

export const taskService = {
  createTask: async (projectId: string, data: any) => {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },
  getTasksByProject: async (projectId: string, params?: any) => {
    const response = await api.get(`/projects/${projectId}/tasks`, { params });
    return response.data;
  },
  updateTask: async (taskId: string, data: any) => {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data;
  },
  addTaskComment: async (taskId: string, content: string) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },
  getTaskComments: async (taskId: string) => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },
  getPublicTasks: async (page = 1, limit = 10) => {
    const response = await api.get('/tasks/public', { params: { page, limit } });
    return response.data;
  },
  getJoinedTasks: async (page = 1, limit = 10) => {
    const response = await api.get('/tasks/joined', { params: { page, limit } });
    return response.data;
  }
};
