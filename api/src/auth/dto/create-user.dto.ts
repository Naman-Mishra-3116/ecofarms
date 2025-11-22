import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password should contain at least 6 characters' })
  @MaxLength(12, { message: 'Password can at most contain 12 characters' })
  @Transform(({ value }) => value.trim())
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Transform(({ value }) => value.trim())
  userName: string;
}
