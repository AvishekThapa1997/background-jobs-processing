import { PickType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { JobStatus, JobType } from '../constants/job.enum.js';

export class JobDto {
  id: number;
  status: JobStatus;
  type: JobType;
  createdAt: Date;
}

export class CreateJobDto {
  @IsEnum(JobType)
  type: JobType;

  @IsObject()
  payload: Record<string, unknown>;
}

export class UpdateJobDto extends PickType(CreateJobDto, ['payload']) {}
