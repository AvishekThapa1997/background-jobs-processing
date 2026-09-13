import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module.js';
import { DbModule } from './db/db.module.js';
import { AppConfigModule } from './app-config/app-config.module.js';
import { QueueModule } from './queue/queue.module.js';

@Module({
  imports: [AppConfigModule, DbModule, JobsModule, QueueModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
