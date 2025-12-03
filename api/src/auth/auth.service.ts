import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Response } from 'express';
import { Model } from 'mongoose';
import { Admin } from 'src/admin/admin.schema';
import { JwtConfigService } from 'src/jwtconfig/jwtconfig.service';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
import { User } from 'src/user/user.schema';
import { Cookie } from 'src/utils/enums/cookie.enum';
import { Token } from 'src/utils/enums/token.enum';
import { CreateAdminOrUserDto } from './dto/create-user.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LoginUserOrAdminDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { BcryptService } from './providers/bcrypt.provider';
import { GoogleLoginDto } from './dto/google-login.dto';
import { GoogleAuthProvider } from './providers/google-auth.provider';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Admin.name)
    private readonly adminModel: Model<Admin>,
    private readonly bcryptService: BcryptService,
    private readonly jwtConfigService: JwtConfigService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
    private readonly googleAuthService: GoogleAuthProvider,
  ) {}

  public async userSignUp(createUserDto: CreateAdminOrUserDto) {
    const { email, password, userName } = createUserDto;
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new BadRequestException(
        'User with the email is already registered',
      );
    }

    const hashedPassword = await this.bcryptService.hashPassword(password);

    const user = await this.userModel.create({
      password: hashedPassword,
      email,
      userName,
    });

    if (!user) {
      throw new InternalServerErrorException('Internal server error');
    }

    return {
      status: 'success',
      message: 'Registration Completed',
      data: {
        email: user.email,
        id: user._id,
      },
      error: false,
      success: true,
    };
  }

  public async userSignIn(loginUserDto: LoginUserOrAdminDto, res: Response) {
    const { email, password } = loginUserDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('User with specified email does not exist');
    }

    if (user.googleId && !user.password) {
      throw new BadRequestException(
        'This account was created using Google. Please login with Google.',
      );
    }

    const isValidPassword = await this.bcryptService.verifyPassword(
      password,
      user.password as string,
    );

    if (!isValidPassword) {
      throw new BadRequestException(
        'Invalid credentials, Please provide correct password',
      );
    }

    const payload = {
      email: user.email,
      id: user._id.toString(),
    };

    const accessToken = await this.jwtConfigService.generateToken(
      payload,
      Token.AccessUser,
    );

    const refreshToken = await this.jwtConfigService.generateToken(
      payload,
      Token.Refresh,
    );

    const accessCookie = this.jwtConfigService.setCookies(
      Cookie.UserAccess,
      accessToken,
      res,
    );

    const refreshCookie = this.jwtConfigService.setCookies(
      Cookie.UserRefresh,
      refreshToken,
      res,
    );

    if (!accessCookie || !refreshCookie) {
      throw new InternalServerErrorException(
        'Something went wrong while setting cookies',
      );
    }

    return {
      success: true,
      error: false,
      message: 'Logged in successfully',
      email: user.email,
    };
  }

  public async forgetPassword(forgetPassDTO: ForgetPasswordDto, res: Response) {
    const { email } = forgetPassDTO;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('No user with specified email exist');
    }

    const otp = await this.otpService.createOTP({
      email: user.email,
      target: 'user',
    });

    const payload = {
      email: user.email,
      id: user._id.toString(),
    };

    const otpToken = await this.jwtConfigService.generateToken(
      payload,
      Token.Otp,
    );

    const otpCookies = this.jwtConfigService.setCookies(
      Cookie.OtpCookie,
      otpToken,
      res,
    );

    const mailSent = await this.mailService.sendOTPMail(
      { email: user.email, userName: user.userName },
      otp,
    );

    if (!mailSent || !otpCookies) {
      throw new InternalServerErrorException('Something went wrong.');
    }

    return {
      message: 'Verification OTP has been sent to your email',
      success: true,
      error: false,
      status: 'success',
      data: {
        userName: user.userName,
      },
    };
  }

  public async verifyOtp(
    email: string,
    otp: VerifyOTPDto,
    target: 'user' | 'admin',
    res: Response,
  ) {
    const model: Model<any> =
      target === 'user' ? this.userModel : this.adminModel;

    const entity = await model.findOne({ email });

    if (!entity) {
      throw new BadRequestException('User with email not found!');
    }

    const isValidOtp = await this.otpService.validateOTP(
      otp.otp,
      email,
      target,
    );

    if (!isValidOtp) {
      throw new BadRequestException('OTP not valid');
    }

    res.clearCookie(Cookie.OtpCookie);
    const resetToken = await this.jwtConfigService.generateToken(
      {
        email: entity.email,
        id: entity._id.toString(),
      },
      Token.Reset,
    );

    const cookieGenerated = this.jwtConfigService.setCookies(
      Cookie.ResetCookie,
      resetToken,
      res,
    );

    if (cookieGenerated) {
      return {
        status: 'success',
        error: false,
        message: 'OTP Verified successfully!',
        success: true,
      };
    }
  }

  public async resetPassword(
    email: string,
    resetPassDTO: ResetPasswordDto,
    res: Response,
    target: 'user' | 'admin',
  ) {
    const model: Model<any> =
      target === 'user' ? this.userModel : this.adminModel;
    const entity = await model.findOne({ email });

    if (!entity) {
      throw new BadRequestException(
        `${target === 'user' ? 'User' : 'Admin'} with specified email not found`,
      );
    }

    const hashedPassword = await this.bcryptService.hashPassword(
      resetPassDTO.password,
    );

    entity.password = hashedPassword;
    res.clearCookie(Cookie.ResetCookie);
    await entity.save();
    return {
      success: true,
      message: 'Password reset successfully!',
      status: 'success',
      error: false,
      data: {
        userName: entity.userName,
      },
    };
  }

  public async googleLogin(googleLoginDto: GoogleLoginDto, res: Response) {
    return this.googleAuthService.authenticate(googleLoginDto, res);
  }
}
