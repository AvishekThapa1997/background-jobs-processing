import { Processor, WorkerHost } from '@nestjs/bullmq';
import { APP_CONSTANTS } from '../../common/constants/app-constants.js';
import { Job } from 'bullmq';
import { EmailPayload } from '../payload/email.payload.js';
import { PrismaService } from '../../db/db.service.js';
import { EmailService } from '../../email/email.service.js';
import { Prisma } from '../../generated/prisma/client.js';
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
    // const data = job.data;
    const jobId = job.id;
    const dbJobId = jobId?.replace('job-', '') ?? '';
    const { template, to } = job.data;
    this.logger.log('Job Id:', jobId, 'Job payload:', job.data);
    const _dbId = Number(dbJobId);
    const where: Prisma.JobWhereUniqueInput = {
      id: _dbId,
    };
    //MARK JOB AS PROCESSING
    await this.prismaService.job.update({
      where,
      data: {
        status: 'PROCESSING',
      },
    });
    await this.emailService.sendEmail(to, template);

    //MARK JOB AS COMPLETED
    await this.prismaService.job.update({
      where,
      data: {
        status: 'COMPLETED',
      },
    });
  }
}
