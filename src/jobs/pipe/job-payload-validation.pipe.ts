import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JOB_PAYLOAD_MAP } from '../constants/job.map.js';
import { JobType } from '../constants/job.enum.js';

@Injectable()
export class JobPayloadValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { type, payload } = value;
    const PayloadDto = JOB_PAYLOAD_MAP[type as JobType];
    if (!PayloadDto) {
      throw new BadRequestException(`Unsupported job type: ${type}`);
    }
    const payloadInstance = plainToInstance(PayloadDto, payload);
    const errors = await validate(payloadInstance);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return {
      ...value,
      payload: payloadInstance,
    };
  }
}
