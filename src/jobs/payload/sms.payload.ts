// sms-payload.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class SmsPayload {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
