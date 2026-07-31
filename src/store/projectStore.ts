import { create } from 'zustand';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  bountyAmount: number;
  aiRiskScore?: number;
  assigneeId?: string;
  estimatedTime?: number; // hours
  timeElapsed?: number; // hours
}

export interface Project {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  budget: number;
  tasks: Task[];
}

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project | null) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: Task['status']) => void;
  updateTaskRisk: (projectId: string, taskId: string, riskScore: number) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProject: null,
  
  setProjects: (projects) => set({ projects }),
  
  setActiveProject: (project) => set({ activeProject: project }),
  
  updateTaskStatus: (projectId, taskId, status) => set((state) => {
    // Update active project if it matches
    const updatedActive = state.activeProject?.id === projectId 
      ? {
          ...state.activeProject,
          tasks: state.activeProject.tasks.map(t => t.id === taskId ? { ...t, status } : t)
        }
      : state.activeProject;
      
    // Update list
    const updatedProjects = state.projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t)
        };
      }
      return p;
    });

    return { activeProject: updatedActive, projects: updatedProjects };
  }),
  
  updateTaskRisk: (projectId, taskId, riskScore) => set((state) => {
    const updatedActive = state.activeProject?.id === projectId 
      ? {
          ...state.activeProject,
          tasks: state.activeProject.tasks.map(t => t.id === taskId ? { ...t, aiRiskScore: riskScore } : t)
        }
      : state.activeProject;
      
    return { activeProject: updatedActive };
  }),
}));
