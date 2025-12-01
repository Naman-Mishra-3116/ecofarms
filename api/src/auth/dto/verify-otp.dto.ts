import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    IsString,
    Matches
} from 'class-validator';

export class VerifyOTPDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches(/^[1-9]\d{5}$/, {
    message: 'OTP must be a 6-digit number and cannot start with 0',
  })
  otp: string;
}
