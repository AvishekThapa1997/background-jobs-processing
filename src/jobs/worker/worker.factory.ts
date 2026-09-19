import { Inject, Injectable } from '@nestjs/common';
import { EmailWorker } from './email.worker.js';
import { JobType } from '../constants/job.enum.js';
import { IWorker } from './IWorker.js';
import { MessageWorker } from './messager.worker.js';

@Injectable()
export class JobWorkerFactory {
  constructor(
    private readonly emailWorker: EmailWorker,
    private readonly messageWorker: MessageWorker,
  ) {}

  getWorker(jobType: JobType): IWorker {
    if (jobType === JobType.SEND_EMAIL) {
      return this.emailWorker;
    }
    return this.messageWorker;
  }
}
