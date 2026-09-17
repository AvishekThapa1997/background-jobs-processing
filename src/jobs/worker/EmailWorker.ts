import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { APP_CONSTANTS } from '../../common/constants/app-constants.js';
import { Job } from 'bullmq';
import { EmailPayload } from '../payload/email.payload.js';
import { PrismaService } from '../../db/db.service.js';
import { EmailService } from '../../email/email.service.js';
import { Logger, LoggerService } from '@nestjs/common';

@Processor(APP_CONSTANTS.QUEUE_NAME.SEND_EMAIL)
export class EmailWorker extends WorkerHost {
  private logger: Logger = new Logger(EmailWorker.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {
    super();
  }
  async process(job: Job<EmailPayload>): Promise<any> {
    const jobId = job.id?.replace('job-', '') ?? '';
    const { template, to } = job.data;
    this.logger.log('Job Id:', jobId, 'Job payload:', job.data);
    const _dbId = Number(jobId);
    await this.prismaService.job.update({
      where: {
        id: _dbId,
        OR: [{ status: 'PENDING' }, { status: 'FAILED' }],
      },
      data: {
        status: 'PROCESSING',
      },
    });
    await this.emailService.sendEmail(to, template);
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

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<EmailPayload> | undefined,
    error: Error,
    prev: string,
  ) {
    if (!job) {
      return;
    }
    const jobId = job.id?.replace('job-', '');
    if (!jobId) {
      return;
    }
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
