import { Job } from 'bullmq';
import { IWorker } from './IWorker.js';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../email/email.service.js';
import { EmailPayload } from '../payload/email.payload.js';
import { JobPayload } from '../types/index.js';

@Injectable()
export class EmailWorker implements IWorker {
  private logger: Logger = new Logger(EmailWorker.name);
  constructor(private readonly emailService: EmailService) {}
  async execute(job: Job<JobPayload<EmailPayload>>) {
    this.logger.log('Job Id:', job.id, 'Job payload:', job.data);
    const { to, template } = job.data.data;
    await this.emailService.sendEmail(to, template);
    this.logger.log(`Email worker completed for : ${to}`);
  }
}
