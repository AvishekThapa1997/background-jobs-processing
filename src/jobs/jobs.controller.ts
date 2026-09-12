import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { CreateJobDto } from './dto/job.dto.js';
import { JobPayloadValidationPipe } from './pipe/job-payload-validation.pipe.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobsService) {}
  @Post()
  @UsePipes(JobPayloadValidationPipe)
  create(
    @Body(JobPayloadValidationPipe)
    createJobDto: CreateJobDto,
  ) {
    return this.jobService.create(createJobDto);
  }
}
