import { Command } from 'commander';
import { createEnv } from './create.js';
import { listEnvs } from './list.js';
import { showEnv } from './show.js';
import { deleteEnv } from './delete.js';

export const envCommand = new Command('env')
  .description('Manage environments');

envCommand
  .command('create')
  .description('Create a new environment')
  .argument('<name>', 'Environment name')
  .requiredOption('--repo <url>', 'Git repository URL')
  .option('--branch <branch>', 'Git branch', 'main')
  .option('--image <image>', 'Docker image', 'claude-cli:latest')
  .option('--env <key=value>', 'Environment variable', [])
  .action(createEnv);

envCommand
  .command('list')
  .description('List all environments')
  .action(listEnvs);

envCommand
  .command('show')
  .description('Show environment details')
  .argument('<id>', 'Environment ID or name')
  .action(showEnv);

envCommand
  .command('delete')
  .description('Delete an environment')
  .argument('<id>', 'Environment ID or name')
  .action(deleteEnv);