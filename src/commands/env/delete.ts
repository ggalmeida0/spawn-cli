import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { Storage } from '../../lib/storage.js';

export async function deleteEnv(id: string): Promise<void> {
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

  // Check for active workers
  const workers = storage.getWorkersByEnv(env.id);
  const activeWorkers = workers.filter(w => w.status === 'running');
  
  if (activeWorkers.length > 0) {
    console.error(chalk.red(`Cannot delete environment "${env.name}" - it has ${activeWorkers.length} active workers`));
    console.log(chalk.yellow('Destroy all workers first or use "spawn worker destroy-all --env <id>"'));
    process.exit(1);
  }

  const shouldDelete = await confirm({
    message: `Are you sure you want to delete environment "${env.name}"?`,
    default: false
  });

  if (!shouldDelete) {
    console.log(chalk.yellow('Environment deletion cancelled'));
    return;
  }

  // Delete all workers for this environment
  for (const worker of workers) {
    storage.deleteWorker(worker.id);
  }

  // Delete the environment
  storage.deleteEnv(env.id);
  
  console.log(chalk.green(`Environment "${env.name}" deleted successfully`));
}