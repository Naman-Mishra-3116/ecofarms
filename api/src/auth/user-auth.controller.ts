import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAdminOrUserDto } from './dto/create-user.dto';
import { LoginUserOrAdminDto } from './dto/login-user.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';

@Controller('auth/user')
export class UserAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  public signUp(@Body() createUserDto: CreateAdminOrUserDto) {
    return this.authService.userSignUp(createUserDto);
  }

  @Post('sign-in')
  public signIn(
    @Body() loginUserDto: LoginUserOrAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.userSignIn(loginUserDto, res);
  }

  @Post('forget-password')
  public forgetPassCl(
    @Body() forgetPassDTO: ForgetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.forgetPassword(forgetPassDTO, res);
  }
}
