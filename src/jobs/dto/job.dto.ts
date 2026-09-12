import { PickType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { JobType } from '../constants/job.enum.js';

export class CreateJobDto {
  @IsEnum(JobType)
  type: JobType;

  @IsObject()
  payload: Record<string, unknown>;
}

export class UpdateJobDto extends PickType(CreateJobDto, ['payload']) {}
