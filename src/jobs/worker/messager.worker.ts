import { Job } from 'bullmq';
import { IWorker } from './IWorker.js';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MessageWorker implements IWorker {
  private logger: Logger = new Logger(MessageWorker.name);

  async execute(job: Job) {
    this.logger.log(`Message worker completed for `);
  }
}
