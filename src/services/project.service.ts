import { api } from './api';

export interface CreateProjectPayload {
  title: string;
  description: string;
  budget: number;
  currency?: string;
  type: 'PUBLIC' | 'PRIVATE';
  maxMembers?: number;
  isRecruiting?: boolean;
  skillsRequired?: string;
  deadline?: string;
  initialMemberEmails?: string[];
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  budget?: number;
  currency?: string;
  type?: string;
  maxMembers?: number;
  isRecruiting?: boolean;
  skillsRequired?: string;
  deadline?: string;
}

export interface AddMemberByEmailPayload {
  email: string;
  role: 'PM' | 'LEAD_DEV' | 'REVIEWER' | 'DEV';
  permissions?: string;
}

export interface UpdateMemberPermissionsPayload {
  permissions: string;
  role?: string;
}

export interface RewardMemberPayload {
  amount: number;
  currency?: string;
  reason: string;
}

export interface ApplyProjectPayload {
  coverLetter?: string;
}

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
  createProject: async (data: CreateProjectPayload) => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  getProjectById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  updateProject: async (id: string, data: UpdateProjectPayload) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  addMemberByEmail: async (projectId: string, data: AddMemberByEmailPayload) => {
    const response = await api.post(`/projects/${projectId}/members/email`, data);
    return response.data;
  },
  updateMemberPermissions: async (projectId: string, memberId: string, data: UpdateMemberPermissionsPayload) => {
    const response = await api.put(`/projects/${projectId}/members/${memberId}/permissions`, data);
    return response.data;
  },
  rewardMember: async (projectId: string, memberId: string, data: RewardMemberPayload) => {
    const response = await api.post(`/projects/${projectId}/members/${memberId}/reward`, data);
    return response.data;
  },
  applyForProject: async (projectId: string, data?: ApplyProjectPayload) => {
    const response = await api.post(`/projects/${projectId}/applications`, data || {});
    return response.data;
  },
  getApplications: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/applications`);
    return response.data;
  },
  processApplication: async (projectId: string, applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.put(`/projects/${projectId}/applications/${applicationId}`, { status });
    return response.data;
  },
  updateApplicationStatus: async (projectId: string, applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.put(`/projects/${projectId}/applications/${applicationId}`, { status });
    return response.data;
  },
  assignRole: async (projectId: string, data: { userId: string; role: string }) => {
    const response = await api.post(`/projects/${projectId}/members`, data);
    return response.data;
  }
};
