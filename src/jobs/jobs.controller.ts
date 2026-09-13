import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Param,
  UsePipes,
} from '@nestjs/common';
import { JobService } from './jobs.service.js';
import { CreateJobDto, JobDto } from './dto/job.dto.js';
import { JobPayloadValidationPipe } from './pipe/job-payload-validation.pipe.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobService) {}
  @Post()
  @UsePipes(JobPayloadValidationPipe)
  create(
    @Body(JobPayloadValidationPipe)
    createJobDto: CreateJobDto,
  ) {
    return this.jobService.create(createJobDto);
  }

  @Get(':jobId')
  async getJob(@Param('jobId', ParseIntPipe) jobId: number): Promise<JobDto> {
    const job = this.jobService.getJob(jobId);
    return job;
  }
}
