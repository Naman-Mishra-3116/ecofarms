import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth/user')
export class UserAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  public signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.userSignUp(createUserDto);
  }
}
