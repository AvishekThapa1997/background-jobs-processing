import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller.js';
import { JobService } from './jobs.service.js';
import { QueueModule } from '../queue/queue.module.js';
import { EmailWorker } from './worker/EmailWorker.js';

@Module({
  imports: [QueueModule],
  controllers: [JobsController],
  providers: [JobService, EmailWorker],
})
export class JobsModule {}
