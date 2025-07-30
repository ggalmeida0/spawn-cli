import chalk from 'chalk';
import ora from 'ora';
import { nanoid } from 'nanoid';
import editor from 'editor';
import { Storage } from '../../lib/storage.js';
import { DockerManager } from '../../lib/docker.js';
import { WorkerCreateOptions, Worker } from '../../types/index.js';

export async function createWorker(options: WorkerCreateOptions): Promise<void> {
  const storage = new Storage();
  const dockerManager = new DockerManager();
  
  // Find environment by ID or name
  let env = storage.getEnv(options.env);
  if (!env) {
    env = storage.getEnvByName(options.env);
  }
  
  if (!env) {
    console.error(chalk.red(`Environment "${options.env}" not found`));
    console.log(chalk.yellow('Available environments:'));
    const envs = storage.getAllEnvs();
    if (envs.length > 0) {
      for (const e of envs) {
        console.log(`  ${chalk.cyan(e.id)} ${e.name}`);
      }
    } else {
      console.log(chalk.gray('  No environments found. Create one with "spawn env create"'));
    }
    process.exit(1);
  }

  // Get prompt from options or editor
  let prompt = options.prompt;
  if (!prompt) {
    console.log(chalk.blue('Opening editor for prompt...'));
    const template = `# Worker Prompt for Environment: ${env.name}
# Repository: ${env.repoUrl}

<!-- Write your prompt below -->

`;
    try {
      prompt = await new Promise<string>((resolve, reject) => {
        editor(template, (code: number, output: string) => {
          if (code !== 0) {
            reject(new Error('Editor cancelled'));
          } else {
            // Remove template comments and extract actual prompt
            const lines = output.split('\n');
            const promptLines = lines.filter((line: string) => 
              !line.startsWith('#') && 
              !line.startsWith('<!--') && 
              !line.includes('-->') &&
              line.trim() !== ''
            );
            resolve(promptLines.join('\n').trim());
          }
        });
      });
    } catch (error) {
      console.log(chalk.yellow('Prompt entry cancelled'));
      return;
    }

    if (!prompt) {
      console.error(chalk.red('No prompt provided'));
      return;
    }
  }

  console.log(chalk.green(`Environment: ${env.name} (${env.id})`));
  console.log(chalk.blue(`Prompt: ${prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt}`));

  const spinner = ora('Checking Docker connection...').start();

  try {
    // Check Docker connection
    const dockerConnected = await dockerManager.checkDockerConnection();
    if (!dockerConnected) {
      spinner.fail('Docker is not running. Please start Docker and try again.');
      return;
    }

    // Check if image exists
    spinner.text = 'Checking Docker image...';
    const imageExists = await dockerManager.checkImageExists();
    if (!imageExists) {
      spinner.text = 'Building Docker image (this may take a few minutes)...';
      await dockerManager.buildImage();
      spinner.succeed('Docker image built successfully');
    } else {
      spinner.succeed('Docker image ready');
    }

    // Create worker record
    const worker: Worker = {
      id: nanoid(8),
      envId: env.id,
      prompt,
      status: 'creating',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    storage.saveWorker(worker);
    
    const createSpinner = ora(`Creating worker ${worker.id}...`).start();

    // Create and start Docker container
    const { container, workerId } = await dockerManager.createWorker(env, prompt, {
      detached: options.detached || false,
      interactive: false
    });

    // Update worker with container ID
    worker.containerId = workerId;
    worker.status = 'running';
    storage.saveWorker(worker);

    createSpinner.succeed(`Worker ${worker.id} created`);

    if (options.detached) {
      console.log(chalk.green(`Worker running in background`));
      console.log(chalk.gray(`  View logs: spawn worker logs ${worker.id} --follow`));
      console.log(chalk.gray(`  Connect: spawn worker connect ${worker.id}`));
      console.log(chalk.gray(`  Destroy: spawn worker destroy ${worker.id}`));
      
      // Start container in background
      await dockerManager.startWorkerAndStream(container, workerId, true);
    } else {
      console.log(chalk.green(`Streaming worker output (Ctrl+C to detach):`));
      console.log('─'.repeat(50));
      
      try {
        // Stream output to console
        await dockerManager.startWorkerAndStream(container, workerId, false);
        
        // Update worker status
        worker.status = 'stopped';
        worker.lastActivity = new Date();
        storage.saveWorker(worker);
        
        console.log('─'.repeat(50));
        console.log(chalk.green(`Worker ${worker.id} completed`));
      } catch (error) {
        worker.status = 'failed';
        worker.lastActivity = new Date();
        storage.saveWorker(worker);
        
        console.log('─'.repeat(50));
        console.error(chalk.red(`Worker ${worker.id} failed: ${error instanceof Error ? error.message : error}`));
      }
    }

  } catch (error) {
    spinner.fail(`Failed to create worker: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}