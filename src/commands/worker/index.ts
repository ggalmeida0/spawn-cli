import { Command } from 'commander';
import { createWorker } from './create.js';
import { listWorkers } from './list.js';
import { connectWorker } from './connect.js';
import { logsWorker } from './logs.js';
import { destroyWorker } from './destroy.js';

export const workerCommand = new Command('worker')
  .description('Manage workers');

workerCommand
  .command('create')
  .description('Create a new worker')
  .requiredOption('--env <name>', 'Environment name or ID')
  .option('--prompt <prompt>', 'Worker prompt')
  .option('--detached', 'Run in background')
  .action(createWorker);

workerCommand
  .command('list')
  .description('List workers')
  .option('--env <name>', 'Filter by environment name or ID')
  .option('--status <status>', 'Filter by status')
  .action(listWorkers);

workerCommand
  .command('connect')
  .description('Connect to worker shell')
  .argument('<id>', 'Worker ID')
  .action(connectWorker);

workerCommand
  .command('logs')
  .description('Show worker logs')
  .argument('<id>', 'Worker ID')
  .option('--follow', 'Follow log output')
  .action(logsWorker);

workerCommand
  .command('destroy')
  .description('Destroy a worker')
  .argument('<id>', 'Worker ID')
  .action(destroyWorker);