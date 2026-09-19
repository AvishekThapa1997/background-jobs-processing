import { Job } from 'bullmq';
import { JobType } from '../constants/job.enum.ts';

export type DLQJobPayload<T = any> = {
  data: T;
  orginalJobId: string;
  attempts: Job['opts']['attempts'];
  attempstMade: Job['attemptsMade'];
  failedReason: Job['failedReason'];
  lastProcessedOn: Job['finishedOn'];
  createAt: Job['timestamp'];
};

export type JobPayload<D = any> = {
  data: D;
  type: JobType;
};
