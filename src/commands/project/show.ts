import chalk from 'chalk';
import { Storage } from '../../lib/storage.js';

export async function showProject(id: string): Promise<void> {
  const storage = new Storage();
  
  // Try to find by ID first, then by name
  let project = storage.getProject(id);
  if (!project) {
    project = storage.getProjectByName(id);
  }

  if (!project) {
    console.error(chalk.red(`Project "${id}" not found`));
    process.exit(1);
  }

  const workers = storage.getWorkersByProject(project.id);

  console.log(chalk.bold(`\nProject: ${project.name}`));
  console.log('─'.repeat(50));
  console.log(`ID: ${chalk.cyan(project.id)}`);
  console.log(`Repository: ${chalk.gray(project.repoUrl)}`);
  console.log(`Branch: ${chalk.gray(project.branch)}`);
  console.log(`Docker Image: ${chalk.gray(project.dockerImage)}`);
  console.log(`Created: ${chalk.gray(project.createdAt.toLocaleString())}`);
  
  if (Object.keys(project.environmentVars).length > 0) {
    console.log(`\nEnvironment Variables:`);
    for (const [key, value] of Object.entries(project.environmentVars)) {
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