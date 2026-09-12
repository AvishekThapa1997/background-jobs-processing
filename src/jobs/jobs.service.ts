import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/job.dto.js';
import { PrismaService } from '../db/db.service.js';
import { AppConfigService } from '../app-config/app-config.service.js';
import { appConstants } from '../common/constants/app-constants.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class JobsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async create(createJobDto: CreateJobDto) {
    const maxReattempts = await this.appConfigService.get(
      appConstants.MAX_RETRY_ATTEMPTS,
    );
    return this.prismaService.job.create({
      data: {
        type: createJobDto.type,
        payload: createJobDto.payload as Prisma.InputJsonValue,
        maxReattempts: Number(maxReattempts),
      },
    });
  }
}
