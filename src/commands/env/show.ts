import chalk from 'chalk';
import { Storage } from '../../lib/storage.js';

export async function showEnv(id: string): Promise<void> {
  const storage = new Storage();
  
  // Try to find by ID first, then by name
  let env = storage.getEnv(id);
  if (!env) {
    env = storage.getEnvByName(id);
  }

  if (!env) {
    console.error(chalk.red(`Environment "${id}" not found`));
    process.exit(1);
  }

  const workers = storage.getWorkersByEnv(env.id);

  console.log(chalk.bold(`\nEnvironment: ${env.name}`));
  console.log('─'.repeat(50));
  console.log(`ID: ${chalk.cyan(env.id)}`);
  console.log(`Repository: ${chalk.gray(env.repoUrl)}`);
  console.log(`Branch: ${chalk.gray(env.branch)}`);
  console.log(`Docker Image: ${chalk.gray(env.dockerImage)}`);
  console.log(`Created: ${chalk.gray(env.createdAt.toLocaleString())}`);
  
  if (Object.keys(env.environmentVars).length > 0) {
    console.log(`\nEnvironment Variables:`);
    for (const [key, value] of Object.entries(env.environmentVars)) {
      console.log(`  ${key}=${value}`);
    }
  }

  console.log(`\nWorkers: ${workers.length}`);
  if (workers.length > 0) {
    for (const worker of workers) {
      const statusColor = worker.status === 'running' ? 'green' : 
                         worker.status === 'failed' ? 'red' : 'yellow';
      console.log(`  ${chalk.cyan(worker.id)} - ${chalk[statusColor](worker.status)}`);
    }
  }
}