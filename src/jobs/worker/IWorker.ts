import { Job } from 'bullmq';

export interface IWorker<R = void> {
  execute: (job: Job) => Promise<R>;
}
