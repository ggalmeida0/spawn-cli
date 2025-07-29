import { Command } from 'commander';
import { createProject } from './create.js';
import { listProjects } from './list.js';
import { showProject } from './show.js';
import { deleteProject } from './delete.js';

export const projectCommand = new Command('project')
  .description('Manage projects');

projectCommand
  .command('create')
  .description('Create a new project')
  .argument('<name>', 'Project name')
  .requiredOption('--repo <url>', 'Git repository URL')
  .option('--branch <branch>', 'Git branch', 'main')
  .option('--image <image>', 'Docker image', 'claude-cli:latest')
  .option('--env <key=value>', 'Environment variable', [])
  .action(createProject);

projectCommand
  .command('list')
  .description('List all projects')
  .action(listProjects);

projectCommand
  .command('show')
  .description('Show project details')
  .argument('<id>', 'Project ID or name')
  .action(showProject);

projectCommand
  .command('delete')
  .description('Delete a project')
  .argument('<id>', 'Project ID or name')
  .action(deleteProject);