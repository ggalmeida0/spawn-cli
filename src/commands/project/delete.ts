import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { Storage } from '../../lib/storage.js';

export async function deleteProject(id: string): Promise<void> {
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

  // Check for active workers
  const workers = storage.getWorkersByProject(project.id);
  const activeWorkers = workers.filter(w => w.status === 'running');
  
  if (activeWorkers.length > 0) {
    console.error(chalk.red(`Cannot delete project "${project.name}" - it has ${activeWorkers.length} active workers`));
    console.log(chalk.yellow('Destroy all workers first or use "spawn worker destroy-all --project <id>"'));
    process.exit(1);
  }

  const shouldDelete = await confirm({
    message: `Are you sure you want to delete project "${project.name}"?`,
    default: false
  });

  if (!shouldDelete) {
    console.log(chalk.yellow('Project deletion cancelled'));
    return;
  }

  // Delete all workers for this project
  for (const worker of workers) {
    storage.deleteWorker(worker.id);
  }

  // Delete the project
  storage.deleteProject(project.id);
  
  console.log(chalk.green(`Project "${project.name}" deleted successfully`));
}