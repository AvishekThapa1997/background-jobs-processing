import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module.js';
import { DbModule } from './db/db.module.js';
import { AppConfigModule } from './app-config/app-config.module.js';

@Module({
  imports: [AppConfigModule, DbModule, JobsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
