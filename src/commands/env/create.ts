import { nanoid } from 'nanoid';
import chalk from 'chalk';
import ora from 'ora';
import { Storage } from '../../lib/storage.js';
import { Env, EnvCreateOptions } from '../../types/index.js';

export async function createEnv(
  name: string,
  options: EnvCreateOptions
): Promise<void> {
  const storage = new Storage();
  const spinner = ora('Creating environment...').start();

  try {
    // Check if env name already exists
    const existingEnv = storage.getEnvByName(name);
    if (existingEnv) {
      spinner.fail(`Environment "${name}" already exists`);
      return;
    }

    // Parse environment variables
    const environmentVars: Record<string, string> = {};
    if (options.env) {
      for (const envVar of options.env) {
        const [key, value] = envVar.split('=');
        if (key && value) {
          environmentVars[key] = value;
        }
      }
    }

    const env: Env = {
      id: nanoid(8),
      name,
      repoUrl: options.repo,
      branch: options.branch || 'main',
      dockerImage: options.image || 'claude-cli:latest',
      environmentVars,
      createdAt: new Date()
    };

    storage.saveEnv(env);
    
    spinner.succeed(`Environment "${name}" created successfully`);
    console.log(`Environment ID: ${chalk.cyan(env.id)}`);
    console.log(`Repository: ${chalk.gray(env.repoUrl)}`);
    console.log(`Branch: ${chalk.gray(env.branch)}`);
    console.log(`Docker Image: ${chalk.gray(env.dockerImage)}`);

  } catch (error) {
    spinner.fail(`Failed to create environment: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}