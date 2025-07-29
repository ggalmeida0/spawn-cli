import Conf from 'conf';
import { Project, Worker } from '../types/index.js';

export class Storage {
  private config: any;

  constructor() {
    this.config = new Conf({
      projectName: 'spawn-cli',
      schema: {
        projects: {
          type: 'object',
          default: {}
        },
        workers: {
          type: 'object', 
          default: {}
        }
      }
    });
  }

  // Project methods
  saveProject(project: Project): void {
    const projects = this.config.get('projects') as Record<string, Project>;
    projects[project.id] = project;
    this.config.set('projects', projects);
  }

  getProject(id: string): Project | undefined {
    const projects = this.config.get('projects') as Record<string, Project>;
    const project = projects[id];
    if (project) {
      project.createdAt = new Date(project.createdAt);
    }
    return project;
  }

  getProjectByName(name: string): Project | undefined {
    const projects = this.config.get('projects') as Record<string, Project>;
    const project = Object.values(projects).find(p => p.name === name);
    if (project) {
      project.createdAt = new Date(project.createdAt);
    }
    return project;
  }

  getAllProjects(): Project[] {
    const projects = this.config.get('projects') as Record<string, Project>;
    return Object.values(projects).map(project => ({
      ...project,
      createdAt: new Date(project.createdAt)
    }));
  }

  deleteProject(id: string): boolean {
    const projects = this.config.get('projects') as Record<string, Project>;
    if (projects[id]) {
      delete projects[id];
      this.config.set('projects', projects);
      return true;
    }
    return false;
  }

  // Worker methods
  saveWorker(worker: Worker): void {
    const workers = this.config.get('workers') as Record<string, Worker>;
    workers[worker.id] = worker;
    this.config.set('workers', workers);
  }

  getWorker(id: string): Worker | undefined {
    const workers = this.config.get('workers') as Record<string, Worker>;
    return workers[id];
  }

  getAllWorkers(): Worker[] {
    const workers = this.config.get('workers') as Record<string, Worker>;
    return Object.values(workers);
  }

  getWorkersByProject(projectId: string): Worker[] {
    const workers = this.config.get('workers') as Record<string, Worker>;
    return Object.values(workers).filter(w => w.projectId === projectId);
  }

  deleteWorker(id: string): boolean {
    const workers = this.config.get('workers') as Record<string, Worker>;
    if (workers[id]) {
      delete workers[id];
      this.config.set('workers', workers);
      return true;
    }
    return false;
  }
}