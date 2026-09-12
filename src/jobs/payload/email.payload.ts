// email-payload.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailPayload {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  template: string;
}
