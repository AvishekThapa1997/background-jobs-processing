import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { APP_CONSTANTS } from '../../common/constants/app-constants.js';
import { DLQJobPayload, JobPayload } from '../types/index.js';
import { PrismaService } from '../../db/db.service.js';
import { formatJobId } from '../util/index.js';

@Processor(APP_CONSTANTS.JOB_DLQ)
export class DLQJobProcessor extends WorkerHost {
  private readonly logger = new Logger(DLQJobProcessor.name);

  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async process(job: Job<JobPayload<DLQJobPayload>>): Promise<void> {
    const { orginalJobId, failedReason, lastProcessedOn } = job.data.data;
    try {
      const { type } = job.data;
      this.logger.warn(
        `Processing DLQ job ${job.id} (originalJobId: ${orginalJobId}, type: ${type})`,
      );
      const jobId = formatJobId(orginalJobId);
      await this.prismaService.job.update({
        where: {
          id: jobId,
          status: 'FAILED',
        },
        data: {
          lastProcessedOn: lastProcessedOn ? new Date(lastProcessedOn) : null,
          failedReason,
        },
      });
    } catch (err) {
      this.logger.error(
        'DLQ',
        'Failed to updated job:',
        job.id,
        'Original Job id:',
        orginalJobId,
      );
    }
  }
}
