import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { AppConfigService } from '../app-config/app-config.service.js';
import { APP_CONSTANTS } from '../common/constants/app-constants.js';
import { PrismaService } from '../db/db.service.js';
import { Job } from '../generated/prisma/client.js';
import { JobStatus, JobType } from './constants/job.enum.js';
import { CreateJobDto, JobDto } from './dto/job.dto.js';
import { EmailPayload } from './payload/email.payload.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobPayload } from './types/index.js';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly appConfigService: AppConfigService,
    @InjectQueue(APP_CONSTANTS.JOB_QUEUE)
    private readonly queue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, {
    timeZone: 'Asia/Kolkata',
    disabled: process.env.DISABLE_SCHEDULER === 'true',
  })
  async recoverPendingJobs() {
    try {
      this.logger.log('Recovering Pending Jobs');
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
      const jobs = await this.prismaService.job.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lte: oneMinuteAgo,
          },
        },
      });
      if (jobs.length > 0) {
        for (const job of jobs) {
          this.logger.log(`Job recovery: ${job.id}`);
          await this.addJobToQueue(job, true);
        }
      }
    } catch (err) {
      this.logger.error('Failed to recover pending jobs', err);
    }
  }

  private async addJobToQueue(job: Job, ignoreFailure: boolean = false) {
    const isJobFailureEnabled =
      this.appConfigService.getEnv(
        APP_CONSTANTS.ENVIRONMENT.ENABLE_JOB_FAILURE,
      ) === 'true';

    if (isJobFailureEnabled && !ignoreFailure) {
      this.logger.error('Failed to add job to queue: ', job.id);
      return;
    }
    const jobId = String('#' + job.id);
    const jobDelay = 2 * 60 * 1000;
    const jobOptions: JobsOptions = {
      jobId,
      deduplication: {
        id: jobId,
      },
    };
    const existingQueueJob = await this.queue.getJob(`#${job.id}`);
    if (!existingQueueJob) {
      const jobPayload: JobPayload = {
        type: job.type as JobType,
        data: job.payload,
      };
      const addedJob = await this.queue.add(
        APP_CONSTANTS.JOB_QUEUE,
        jobPayload,
        jobOptions,
      );
      addedJob.name;
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
