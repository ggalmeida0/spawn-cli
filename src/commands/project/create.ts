import { nanoid } from 'nanoid';
import chalk from 'chalk';
import ora from 'ora';
import { Storage } from '../../lib/storage.js';
import { Project, ProjectCreateOptions } from '../../types/index.js';

export async function createProject(
  name: string,
  options: ProjectCreateOptions
): Promise<void> {
  const storage = new Storage();
  const spinner = ora('Creating project...').start();

  try {
    // Check if project name already exists
    const existingProject = storage.getProjectByName(name);
    if (existingProject) {
      spinner.fail(`Project "${name}" already exists`);
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

    const project: Project = {
      id: nanoid(8),
      name,
      repoUrl: options.repo,
      branch: options.branch || 'main',
      dockerImage: options.image || 'claude-cli:latest',
      environmentVars,
      createdAt: new Date()
    };

    storage.saveProject(project);
    
    spinner.succeed(`Project "${name}" created successfully`);
    console.log(`Project ID: ${chalk.cyan(project.id)}`);
    console.log(`Repository: ${chalk.gray(project.repoUrl)}`);
    console.log(`Branch: ${chalk.gray(project.branch)}`);
    console.log(`Docker Image: ${chalk.gray(project.dockerImage)}`);

  } catch (error) {
    spinner.fail(`Failed to create project: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}