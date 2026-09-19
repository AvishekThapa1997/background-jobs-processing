import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { AppConfigService } from '../app-config/app-config.service.js';
import { APP_CONSTANTS } from '../common/constants/app-constants.js';
import { PrismaService } from '../db/db.service.js';
import { Job } from '../generated/prisma/client.js';
import { JobStatus, JobType } from './constants/job.enum.js';
import { CreateJobDto, JobDto } from './dto/job.dto.js';
import { EmailPayload } from './payload/email.payload.js';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly appConfigService: AppConfigService,
    @InjectQueue(APP_CONSTANTS.QUEUE_NAME.SEND_EMAIL)
    private readonly emailQueue: Queue,
    @InjectQueue(APP_CONSTANTS.QUEUE_NAME.SEND_SMS)
    private readonly smsQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, {
    timeZone: 'Asia/Kolkata',
  })
  async recoverPendingJobs() {
    try {
      this.logger.log('Recovering Pending Jobs');
      const twelveHourAgo = new Date(Date.now() - 1 * 60 * 1000);
      const jobs = await this.prismaService.job.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lte: twelveHourAgo,
          },
        },
      });
      if (jobs.length > 0) {
        jobs.forEach((job) => {
          this.logger.log(`Job recovery: ${job.id}`);
          this.addJobToQueue(job, true);
        });
      }
    } catch (err) {
      this.logger.error('Failed to recover pending jobs', err);
    }
  }

  private async addJobToQueue(job: Job, ignoreFailure: boolean = false) {
    const isJobFailureEnabled = this.appConfigService.getEnv<boolean>(
      APP_CONSTANTS.ENVIRONMENT.ENABLE_JOB_FAILURE,
    );
    if (isJobFailureEnabled && !ignoreFailure) {
      this.logger.error('Failed to add job to queue: ', job.id);
      return;
    }
    const jobId = String('#' + job.id);
    const jobDelay = 2 * 60 * 1000;
    const jobOptions: JobsOptions = {
      jobId,
      delay: jobDelay, // delaying for 2 mins
      attempts: job.maxReattempts,
      backoff: {
        type: 'fixed',
        delay: 2000, // retry after every 2 seconds if fails
      },
    };
    let queue: Queue | null = null;
    let queueName = '';
    if (job.type === JobType.SEND_SMS) {
      queue = this.smsQueue;
      queueName = APP_CONSTANTS.QUEUE_NAME.SEND_SMS;
    } else if (job.type === JobType.SEND_EMAIL) {
      queue = this.emailQueue;
      queueName = APP_CONSTANTS.QUEUE_NAME.SEND_EMAIL;
    }

    if (queue) {
      const addedJob = await queue.add(queueName, job.payload, jobOptions);

      this.logger.log(
        `Job added ${addedJob.id} with delay of ${jobDelay} milliseconds`,
      );
    }
  }

  async create(createJobDto: CreateJobDto<EmailPayload>): Promise<JobDto> {
    const maxReattempts = await this.appConfigService.get(
      APP_CONSTANTS.MAX_RETRY_ATTEMPTS,
    );
    const job = await this.prismaService.job.create({
      data: {
        type: createJobDto.type,
        payload: {
          ...createJobDto.payload,
        },
        maxReattempts: Number(maxReattempts),
      },
    });
    await this.addJobToQueue(job);
    return {
      id: job.id,
      status: JobStatus[job.status],
      createdAt: job.createdAt,
      type: JobType[job.type],
    };
  }

  async getJob(jobId: JobDto['id']): Promise<JobDto> {
    const job = await this.prismaService.job.findUnique({
      where: {
        id: jobId,
      },
    });
    if (!job) {
      throw new NotFoundException(`Job not found with id ${jobId}`);
    }
    return {
      id: job.id,
      status: JobStatus[job.status],
      createdAt: job.createdAt,
      type: JobType[job.type],
    };
  }
}
