import { Processor, WorkerHost } from '@nestjs/bullmq';
import { appConstants } from '../../common/constants/app-constants.js';
import { Job } from 'bullmq';
import { EmailPayload } from '../payload/email.payload.js';
import { PrismaService } from '../../db/db.service.js';

@Processor(appConstants.QUEUE_NAME.SEND_EMAIL)
export class EmailWorker extends WorkerHost {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }
  async process(job: Job<EmailPayload>): Promise<any> {
    // const data = job.data;
    const jobId = job.id;
    const dbJobId = jobId?.replace('job-', '') ?? '';
    console.log('Process Job', {
      delay: job.delay,
      id: job.id,
      timestamp: job.timestamp,
      elapsed: Date.now() - job.timestamp,
    });
    const dbJob = await this.prismaService.job.update({
      where: {
        id: Number(dbJobId),
      },
      data: {
        status: 'PROCESSING',
      },
    });
  }
}
