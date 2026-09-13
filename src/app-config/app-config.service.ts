import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../db/db.service.js';
import { appConstants } from '../common/constants/app-constants.js';

@Injectable()
export class AppConfigService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}
  getEnv<T>(key: string): T | undefined {
    return this.configService.get<T>(key);
  }

  async get(key: string): Promise<string> {
    const config = await this.prismaService.config.findUnique({
      where: { key },
    });
    return config?.value ?? appConstants.DEFAULT_MAX_RETRY_ATTEMPTS;
  }
}
