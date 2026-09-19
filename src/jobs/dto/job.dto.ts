import { PickType } from '@nestjs/mapped-types';
import { IsEnum, IsObject } from 'class-validator';
import { JobStatus, JobType } from '../constants/job.enum.js';

export class JobDto {
  id: number;
  status: JobStatus;
  type: JobType;
  createdAt: Date;
}

export class CreateJobDto<T extends object = Record<string, unknown>> {
  @IsEnum(JobType)
  type: JobType;

  @IsObject()
  payload: T;
}

export class UpdateJobDto extends PickType(CreateJobDto, ['payload']) {}
