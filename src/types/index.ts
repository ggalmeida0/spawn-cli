export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  branch: string;
  dockerImage: string;
  environmentVars: Record<string, string>;
  createdAt: Date;
}

export interface Worker {
  id: string;
  projectId: string;
  prompt: string;
  status: 'creating' | 'running' | 'stopped' | 'failed';
  containerId?: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface WorkerCreateOptions {
  project: string;
  prompt?: string;
  detached?: boolean;
}

export interface ProjectCreateOptions {
  repo: string;
  branch?: string;
  image?: string;
  env?: string[];
}