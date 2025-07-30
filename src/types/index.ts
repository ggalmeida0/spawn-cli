export interface Env {
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
  envId: string;
  prompt: string;
  status: 'creating' | 'running' | 'stopped' | 'failed';
  containerId?: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface WorkerCreateOptions {
  env: string;
  prompt?: string;
  detached?: boolean;
}

export interface EnvCreateOptions {
  repo: string;
  branch?: string;
  image?: string;
  env?: string[];
}