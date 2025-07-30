import Docker from 'dockerode';
import { EventEmitter } from 'events';
import { Env, Worker } from '../types/index.js';

export interface DockerWorkerOptions {
  detached: boolean;
  interactive?: boolean;
}

export class DockerManager extends EventEmitter {
  private docker: Docker;
  private readonly imageName = 'spawn-claude:latest';

  constructor() {
    super();
    this.docker = new Docker();
  }

  async checkDockerConnection(): Promise<boolean> {
    try {
      await this.docker.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkImageExists(): Promise<boolean> {
    try {
      await this.docker.getImage(this.imageName).inspect();
      return true;
    } catch (error) {
      return false;
    }
  }

  async buildImage(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.docker.buildImage({
        context: process.cwd(),
        src: ['Dockerfile', 'docker/']
      }, { t: this.imageName }, (err, stream) => {
        if (err) return reject(err);
        
        if (stream) {
          stream.on('data', (chunk) => {
            try {
              const data = JSON.parse(chunk.toString());
              if (data.stream) {
                process.stdout.write(data.stream);
              }
            } catch (error) {
              // Ignore JSON parse errors
            }
          });

          stream.on('end', resolve);
          stream.on('error', reject);
        }
      });
    });
  }

  async createWorker(
    env: Env, 
    prompt: string, 
    options: DockerWorkerOptions
  ): Promise<{ container: Docker.Container; workerId: string }> {
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY or ANTHROPIC_API_KEY environment variable is required');
    }

    const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const containerConfig: Docker.ContainerCreateOptions = {
      Image: this.imageName,
      name: workerId,
      Env: [
        `REPO_URL=${env.repoUrl}`,
        `BRANCH=${env.branch}`,
        `PROMPT=${prompt}`,
        `CLAUDE_API_KEY=${apiKey}`,
        `INTERACTIVE=${options.interactive ? 'true' : 'false'}`,
        ...Object.entries(env.environmentVars).map(([key, value]) => `${key}=${value}`)
      ],
      WorkingDir: '/workspace',
      AttachStdout: true,
      AttachStderr: true,
      Tty: options.interactive || false
    };

    const container = await this.docker.createContainer(containerConfig);
    return { container, workerId };
  }

  async startWorkerAndStream(
    container: Docker.Container, 
    workerId: string,
    detached: boolean = false
  ): Promise<void> {
    await container.start();

    if (!detached) {
      // Stream logs to console
      const stream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: true
      });

      // Add worker ID prefix to output
      stream.on('data', (chunk) => {
        const output = chunk.toString();
        const lines = output.split('\n').filter((line: string) => line.trim());
        lines.forEach((line: string) => {
          // Remove Docker log prefix and timestamp
          const cleanLine = line.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s/, '');
          if (cleanLine.trim()) {
            console.log(`[${workerId}] ${cleanLine}`);
          }
        });
      });

      // Wait for container to finish
      const result = await container.wait();
      
      if (result.StatusCode !== 0) {
        throw new Error(`Worker failed with exit code ${result.StatusCode}`);
      }
    }
  }

  async getWorkerLogs(workerId: string, follow: boolean = false): Promise<any> {
    const container = this.docker.getContainer(workerId);
    return container.logs({
      follow: follow as any,
      stdout: true,
      stderr: true,
      timestamps: true
    });
  }

  async connectToWorker(workerId: string): Promise<void> {
    const container = this.docker.getContainer(workerId);
    
    // Check if container exists and is running
    const info = await container.inspect();
    if (!info.State.Running) {
      throw new Error(`Worker ${workerId} is not running`);
    }

    console.log(`Connecting to worker ${workerId}...`);
    console.log('Use Ctrl+C to detach from the worker');
    
    // This would need to be implemented with proper TTY handling
    // For now, just show the logs
    const stream = await this.getWorkerLogs(workerId, true);
    stream.pipe(process.stdout);
  }

  async destroyWorker(workerId: string, force: boolean = false): Promise<void> {
    const container = this.docker.getContainer(workerId);
    
    try {
      if (force) {
        await container.kill();
      } else {
        await container.stop();
      }
      await container.remove();
    } catch (error) {
      // Container might already be stopped/removed
      console.warn(`Warning: Could not cleanly destroy worker ${workerId}`);
    }
  }

  async listWorkers(): Promise<Array<{ id: string; status: string; created: Date }>> {
    const containers = await this.docker.listContainers({ all: true });
    
    return containers
      .filter(container => container.Names.some(name => name.includes('worker-')))
      .map(container => ({
        id: container.Names[0].replace('/', ''),
        status: container.State,
        created: new Date(container.Created * 1000)
      }));
  }
}