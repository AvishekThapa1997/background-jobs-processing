import { Type } from '@nestjs/common';
import { JobType } from './job.enum.js';
import { EmailPayload } from '../payload/email.payload.js';
import { SmsPayload } from '../payload/sms.payload.js';

export const JOB_PAYLOAD_MAP: Record<JobType, Type<any>> = {
  [JobType.SEND_EMAIL]: EmailPayload,
  [JobType.SEND_SMS]: SmsPayload,
};
