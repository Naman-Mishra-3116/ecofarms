import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password should contain at least 6 characters' })
  @MaxLength(12, { message: 'Password can at most contain 12 characters' })
  @Transform(({ value }) => value.trim())
  password: string;
}
