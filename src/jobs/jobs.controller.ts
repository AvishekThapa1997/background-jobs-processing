import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Param,
  UsePipes,
  UseFilters,
} from '@nestjs/common';
import { JobService } from './jobs.service.js';
import { CreateJobDto, JobDto } from './dto/job.dto.js';
import { JobPayloadValidationPipe } from './pipe/job-payload-validation.pipe.js';
import { AllExceptionsFilter } from '../common/filters/global-exception.filter.js';
import { ApiResult } from '../common/types/index.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobService) {}
  @Post()
  @UsePipes(JobPayloadValidationPipe)
  async create(
    @Body(JobPayloadValidationPipe)
    createJobDto: CreateJobDto,
  ): Promise<ApiResult<JobDto>> {
    const job = await this.jobService.create(createJobDto);
    return {
      success: true,
      data: job,
      message: 'Job created Successfully.',
    };
  }

  @Get(':jobId')
  async getJob(
    @Param('jobId', ParseIntPipe) jobId: number,
  ): Promise<ApiResult<JobDto>> {
    const job = await this.jobService.getJob(jobId);
    return {
      success: true,
      data: job,
    };
  }
}
