#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

// Import command modules
import { envCommand } from './commands/env/index.js';
import { workerCommand } from './commands/worker/index.js';

const program = new Command();

program
  .name('spawn')
  .description('CLI tool for spawning Claude agents in Docker containers')
  .version('0.1.0');

// Add subcommands
program.addCommand(envCommand);
program.addCommand(workerCommand);

// Global error handling
program.configureOutput({
  writeErr: (str) => process.stderr.write(chalk.red(str))
});

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log('Run "spawn --help" for available commands');
  process.exit(1);
});

// Parse arguments
program.parse();