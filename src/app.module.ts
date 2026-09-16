import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module.js';
import { DbModule } from './db/db.module.js';
import { AppConfigModule } from './app-config/app-config.module.js';
import { QueueModule } from './queue/queue.module.js';
import { EmailService } from './email/email.service.js';
import { EmailModule } from './email/email.module.js';

@Module({
  imports: [AppConfigModule, DbModule, JobsModule, QueueModule, EmailModule],
  controllers: [],
  providers: [EmailService],
})
export class AppModule {}
