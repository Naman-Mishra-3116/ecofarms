import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from '../auth.service';
import { CreateAdminOrUserDto } from '../dto/create-user.dto';
import { LoginUserOrAdminDto } from '../dto/login-user.dto';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import { VerifyOTPGuard } from '../../common/guard/verify-otp.guard';
import { VerifiedUser } from '../../common/decorators/verify-user.decorator';
import { VerifyOTPDto } from '../dto/verify-otp.dto';
import { ResetPasswordGuard } from '../../common/guard/reset-password.guard';
import { ResetUser } from '../../common/decorators/reset-user.decorator';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { RefreshGuard } from '../../common/guard/refresh-token.guard';
import { RequestUser } from '../../common/decorators/refresh-user.decorator';
import { Auth } from 'src/utils/enums/auth.enum';
import { Permit } from '../../common/decorators/auth.decorator';
import { Person } from '../../common/decorators/active-user.decorator';

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
  public forgetPass(
    @Body() forgetPassDTO: ForgetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.forgetPassword(forgetPassDTO, res);
  }

  @Post('verify-otp')
  @UseGuards(VerifyOTPGuard)
  public verifyUserOtp(
    @VerifiedUser('email') email: string,
    @Body() otp: VerifyOTPDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyOtp(email, otp, Auth.User, res);
  }

  @Post('reset-password')
  @UseGuards(ResetPasswordGuard)
  public resetPassword(
    @ResetUser('email') email: string,
    @Body() resetPassDTO: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.resetPassword(email, resetPassDTO, res, Auth.User);
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  public refreshToken(
    @RequestUser() user: RefreshPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshAccessToken(user, res);
  }

  @Post('google')
  public googleLogin(
    @Body() googleLoginDto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.googleLogin(googleLoginDto, res);
  }

  @Permit(Auth.User)
  @Get('wow')
  public wowCon(@Person() person: Payload) {
    return person;
  }
}
