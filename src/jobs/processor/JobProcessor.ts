import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { APP_CONSTANTS } from '../../common/constants/app-constants.js';
import { Job } from 'bullmq';
import { EmailPayload } from '../payload/email.payload.js';
import { PrismaService } from '../../db/db.service.js';
import { EmailService } from '../../email/email.service.js';
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
    let jobId = job.id;
    if (!jobId) {
      return;
    }
    jobId = formatJobId(jobId);
    const _dbId = Number(jobId);
    const dbJob = await this.prismaService.job.findUnique({
      where: {
        id: _dbId,
      },
    });
    if (!dbJob) {
      return;
    }
    if (dbJob.status === 'COMPLETED') {
      return;
    }
    if (dbJob.status !== 'PROCESSING') {
      await this.prismaService.job.update({
        where: {
          id: _dbId,
          OR: [{ status: 'PENDING' }, { status: 'FAILED' }],
        },
        data: {
          status: 'PROCESSING',
        },
      });
    }
    const worker = this.workerFactory.getWorker(dbJob.type as JobType);
    await worker.execute(job);
    await this.prismaService.job.update({
      where: {
        id: _dbId,
        status: 'PROCESSING',
      },
      data: {
        status: 'COMPLETED',
      },
    });
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
    if (!job) {
      return;
    }
    let jobId = job.id;
    if (!jobId) {
      return;
    }
    jobId = formatJobId(jobId);
    const maxAttempt = job.opts.attempts;
    const attemptsMade = job.attemptsMade;
    let retryAttemptLeft = false;
    if (maxAttempt !== undefined && maxAttempt > 0) {
      retryAttemptLeft = attemptsMade < maxAttempt;
    }
    if (retryAttemptLeft) {
      return;
    }
    this.logger.error('Job: ', jobId, ' failed', error, prev);
    await this.prismaService.job.update({
      where: {
        id: Number(jobId),
        status: 'PROCESSING',
      },
      data: {
        status: 'FAILED',
      },
    });
  }
}
