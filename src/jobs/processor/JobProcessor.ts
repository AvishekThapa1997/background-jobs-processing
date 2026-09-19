import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { APP_CONSTANTS } from '../../common/constants/app-constants.js';
import { Job } from 'bullmq';
import { EmailPayload } from '../payload/email.payload.js';
import { PrismaService } from '../../db/db.service.js';
import { Logger } from '@nestjs/common';
import { formatJobId } from '../util/index.js';
import { JobWorkerFactory } from '../worker/worker.factory.js';
import { JobType } from '../constants/job.enum.js';

@Processor(APP_CONSTANTS.JOB_QUEUE)
export class JobProcessor extends WorkerHost {
  private logger: Logger = new Logger(JobProcessor.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workerFactory: JobWorkerFactory,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      if (!job.id) {
        return;
      }
      const dbjobId = formatJobId(job.id);
      const dbJob = await this.prismaService.job.findUnique({
        where: {
          id: dbjobId,
        },
      });
      if (!dbJob) {
        return;
      }
      if (dbJob.status === 'COMPLETED') {
        return;
      }
      const worker = this.workerFactory.getWorker(dbJob.type as JobType);
      await worker.execute(job);
    } catch (err) {
      this.logger.error(`Failed to process job ${job.id}`, err);
      throw err;
    }
  }

  private isJobRetryAttempLeft(job: Job) {
    const maxAttempt = job.opts.attempts;
    const attemptsMade = job.attemptsMade;
    if (maxAttempt !== undefined && maxAttempt > 0) {
      return attemptsMade < maxAttempt;
    }
    return false;
  }

  @OnWorkerEvent('active')
  async onActive(job: Job) {
    if (!job.id) {
      return;
    }
    const jobId = formatJobId(job.id);
    try {
      const result = await this.prismaService.job.updateMany({
        where: {
          id: jobId,
          status: 'PENDING',
        },
        data: {
          status: 'PROCESSING',
        },
      });
      if (result.count > 0) {
        this.logger.log(`${job.id} started processing`);
      }
    } catch (err) {
      this.logger.error(`Failed to mark job: ${jobId} as processing`);
    }
  }

  @OnWorkerEvent('completed')
  async onComplete(job: Job) {
    if (!job.id) {
      throw new Error('Job is not available');
    }
    const jobId = formatJobId(job.id);
    try {
      const result = await this.prismaService.job.updateMany({
        where: {
          id: jobId,
          status: 'PROCESSING',
        },
        data: {
          status: 'COMPLETED',
        },
      });
      if (result.count > 0) {
        this.logger.log(`Job: ${job.id} is completed.`);
      }
    } catch (err) {
      this.logger.log(`Failed to mark job ${jobId} as completed.`);
    }
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string, prev: string) {
    this.logger.warn(`Job ${jobId} stalled. Previous state: ${prev}`);
  }

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<EmailPayload> | undefined,
    error: Error,
    prev: string,
  ) {
    if (!job || !job.id) {
      return;
    }
    const jobId = formatJobId(job.id);
    try {
      const retryAttemptLeft = this.isJobRetryAttempLeft(job);
      if (retryAttemptLeft) {
        return;
      }
      this.logger.error('Job: ', jobId, ' failed', error, prev);
      const result = await this.prismaService.job.updateMany({
        where: {
          id: jobId,
          status: 'PROCESSING',
        },
        data: {
          status: 'FAILED',
        },
      });
      if (result.count > 0) {
        this.logger.log(`Job ${job.id} failed`, error);
      }
    } catch (err) {
      this.logger.error(`Failed to mark job: ${jobId} as failed`);
    }
  }
}
