import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtConfigService } from 'src/jwtconfig/jwtconfig.service';
import { User } from 'src/user/user.schema';
import { Token } from 'src/utils/enums/token.enum';
import { CreateAdminOrUserDto } from './dto/create-user.dto';
import { LoginUserOrAdminDto } from './dto/login-user.dto';
import { BcryptService } from './providers/bcrypt.provider';
import type { Response } from 'express';
import { Cookie } from 'src/utils/enums/cookie.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly bcryptService: BcryptService,
    private readonly jwtConfigService: JwtConfigService,
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

    const isValidPassword = await this.bcryptService.verifyPassword(
      password,
      user.password,
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
}
