import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller.js';
import { JobService } from './jobs.service.js';
import { QueueModule } from '../queue/queue.module.js';
import { JobProcessor } from './processor/JobProcessor.js';
import { EmailModule } from '../email/email.module.js';
import { JobWorkerFactory } from './worker/worker.factory.js';
import { EmailWorker } from './worker/email.worker.js';
import { MessageWorker } from './worker/messager.worker.js';

@Module({
  imports: [QueueModule, EmailModule],
  controllers: [JobsController],
  providers: [
    JobService,
    JobProcessor,
    JobWorkerFactory,
    EmailWorker,
    MessageWorker,
  ],
})
export class JobsModule {}
