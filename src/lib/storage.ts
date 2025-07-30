import Conf from 'conf';
import { Env, Worker } from '../types/index.js';

export class Storage {
  private config: any;

  constructor() {
    this.config = new Conf({
      projectName: 'spawn-cli',
      schema: {
        envs: {
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

  // Env methods
  saveEnv(env: Env): void {
    const envs = this.config.get('envs') as Record<string, Env>;
    envs[env.id] = env;
    this.config.set('envs', envs);
  }

  getEnv(id: string): Env | undefined {
    const envs = this.config.get('envs') as Record<string, Env>;
    const env = envs[id];
    if (env) {
      env.createdAt = new Date(env.createdAt);
    }
    return env;
  }

  getEnvByName(name: string): Env | undefined {
    const envs = this.config.get('envs') as Record<string, Env>;
    const env = Object.values(envs).find(e => e.name === name);
    if (env) {
      env.createdAt = new Date(env.createdAt);
    }
    return env;
  }

  getAllEnvs(): Env[] {
    const envs = this.config.get('envs') as Record<string, Env>;
    return Object.values(envs).map(env => ({
      ...env,
      createdAt: new Date(env.createdAt)
    }));
  }

  deleteEnv(id: string): boolean {
    const envs = this.config.get('envs') as Record<string, Env>;
    if (envs[id]) {
      delete envs[id];
      this.config.set('envs', envs);
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

  getWorkersByEnv(envId: string): Worker[] {
    const workers = this.config.get('workers') as Record<string, Worker>;
    return Object.values(workers).filter(w => w.envId === envId);
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