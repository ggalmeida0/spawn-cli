import chalk from 'chalk';
import { Storage } from '../../lib/storage.js';
import { DockerManager } from '../../lib/docker.js';

export async function logsWorker(
  id: string, 
  options: { follow?: boolean } = {}
): Promise<void> {
  const storage = new Storage();
  const dockerManager = new DockerManager();
  
  const worker = storage.getWorker(id);
  if (!worker) {
    console.error(chalk.red(`Worker "${id}" not found`));
    process.exit(1);
  }

  if (!worker.containerId) {
    console.error(chalk.red(`Worker "${id}" has no associated container`));
    process.exit(1);
  }

  try {
    console.log(chalk.blue(`Logs for worker ${id}:`));
    console.log('─'.repeat(50));
    
    const stream = await dockerManager.getWorkerLogs(worker.containerId, options.follow);
    
    stream.on('data', (chunk: any) => {
      const output = chunk.toString();
      const lines = output.split('\n').filter((line: string) => line.trim());
      lines.forEach((line: string) => {
        // Remove Docker log prefix and timestamp if present
        const cleanLine = line.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s/, '');
        if (cleanLine.trim()) {
          console.log(`[${id}] ${cleanLine}`);
        }
      });
    });

    if (options.follow) {
      console.log(chalk.gray('Following logs... Press Ctrl+C to exit'));
      // Keep process alive for following logs
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\nStopped following logs'));
        process.exit(0);
      });
    }

  } catch (error) {
    console.error(chalk.red(`Failed to get logs: ${error instanceof Error ? error.message : error}`));
    process.exit(1);
  }
}