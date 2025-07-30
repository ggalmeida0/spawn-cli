import chalk from 'chalk';
import { Storage } from '../../lib/storage.js';
import { WorkerCreateOptions } from '../../types/index.js';

export async function createWorker(options: WorkerCreateOptions): Promise<void> {
  const storage = new Storage();
  
  // Find environment by ID or name
  let env = storage.getEnv(options.env);
  if (!env) {
    env = storage.getEnvByName(options.env);
  }
  
  if (!env) {
    console.error(chalk.red(`Environment "${options.env}" not found`));
    console.log(chalk.yellow('Available environments:'));
    const envs = storage.getAllEnvs();
    if (envs.length > 0) {
      for (const e of envs) {
        console.log(`  ${chalk.cyan(e.id)} ${e.name}`);
      }
    } else {
      console.log(chalk.gray('  No environments found. Create one with "spawn env create"'));
    }
    process.exit(1);
  }

  console.log(chalk.green(`Found environment: ${env.name} (${env.id})`));
  console.log(chalk.yellow('Worker creation with Docker integration - to be implemented'));
  console.log('Options:', options);
}