import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigService } from '../app-config/app-config.service.js';
import { APP_CONSTANTS } from '../common/constants/app-constants.js';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } =
          APP_CONSTANTS.ENVIRONMENT;
        const host = appConfigService.getEnv(REDIS_HOST);
        const port = appConfigService.getEnv(REDIS_PORT);
        const password = appConfigService.getEnv(REDIS_PASSWORD);
        return {
          connection: {
            host,
            port,
            password,
            tls: {},
          },
        };
      },
    }),
    BullModule.registerQueue(
      {
        name: APP_CONSTANTS.QUEUE_NAME.SEND_EMAIL,
      },
      {
        name: APP_CONSTANTS.QUEUE_NAME.SEND_SMS,
      },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
