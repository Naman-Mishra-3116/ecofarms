import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { BcryptService } from './providers/bcrypt.provider';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { Model } from 'mongoose';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly bcryptService: BcryptService,

  ) {}

  public async userSignUp(createUserDto: CreateUserDto) {
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

  public async userSignIn(loginUserDto:LoginUserDto){
    
  }

}
