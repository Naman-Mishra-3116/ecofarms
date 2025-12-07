import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ResetUser } from 'src/common/decorators/reset-user.decorator';
import { VerifiedUser } from 'src/common/decorators/verify-user.decorator';
import { ResetPasswordGuard } from 'src/common/guard/reset-password.guard';
import { VerifyOTPGuard } from 'src/common/guard/verify-otp.guard';
import { Auth } from 'src/utils/enums/auth.enum';
import { AuthService } from '../auth.service';
import { CreateAdminOrUserDto } from '../dto/create-user.dto';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import { LoginUserOrAdminDto } from '../dto/login-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyOTPDto } from '../dto/verify-otp.dto';
import { Permit } from 'src/common/decorators/auth.decorator';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Permit(Auth.Admin)
  @Post('sign-up')
  public signUp(@Body() createAdminDto: CreateAdminOrUserDto) {
    return this.authService.createAdmin(createAdminDto);
  }

  @Post('sign-in')
  public signIn(
    @Body() loginAdminDto: LoginUserOrAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.adminSignIn(loginAdminDto, res);
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
    return this.authService.verifyOtp(email, otp, Auth.Admin, res);
  }

  @Post('reset-password')
  @UseGuards(ResetPasswordGuard)
  public resetPassword(
    @ResetUser('email') email: string,
    @Body() resetPassDTO: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.resetPassword(email, resetPassDTO, res, Auth.Admin);
  }
}
