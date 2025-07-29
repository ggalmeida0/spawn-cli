import chalk from 'chalk';
import { Storage } from '../../lib/storage.js';

export async function listProjects(): Promise<void> {
  const storage = new Storage();
  const projects = storage.getAllProjects();

  if (projects.length === 0) {
    console.log(chalk.yellow('No projects found. Create one with "spawn project create"'));
    return;
  }

  console.log(chalk.bold('\nProjects:'));
  console.log('─'.repeat(80));

  for (const project of projects) {
    console.log(`${chalk.cyan(project.id)} ${chalk.bold(project.name)}`);
    console.log(`  Repository: ${chalk.gray(project.repoUrl)}`);
    console.log(`  Branch: ${chalk.gray(project.branch)}`);
    console.log(`  Image: ${chalk.gray(project.dockerImage)}`);
    console.log(`  Created: ${chalk.gray(project.createdAt.toLocaleDateString())}`);
    console.log();
  }
}