import chalk from 'chalk';
import { Storage } from '../../lib/storage.js';

export async function listEnvs(): Promise<void> {
  const storage = new Storage();
  const envs = storage.getAllEnvs();

  if (envs.length === 0) {
    console.log(chalk.yellow('No environments found. Create one with "spawn env create"'));
    return;
  }

  console.log(chalk.bold('\nEnvironments:'));
  console.log('─'.repeat(80));

  for (const env of envs) {
    console.log(`${chalk.cyan(env.id)} ${chalk.bold(env.name)}`);
    console.log(`  Repository: ${chalk.gray(env.repoUrl)}`);
    console.log(`  Branch: ${chalk.gray(env.branch)}`);
    console.log(`  Image: ${chalk.gray(env.dockerImage)}`);
    console.log(`  Created: ${chalk.gray(env.createdAt.toLocaleDateString())}`);
    console.log();
  }
}