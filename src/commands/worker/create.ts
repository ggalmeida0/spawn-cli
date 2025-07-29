import { WorkerCreateOptions } from '../../types/index.js';

export async function createWorker(options: WorkerCreateOptions): Promise<void> {
  console.log('Worker create command - to be implemented');
  console.log('Options:', options);
}