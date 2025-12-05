import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model, Types } from 'mongoose';
import { GoogleUser } from './interface/google-user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  public async findOneOrCreateUser(googleUser: GoogleUser) {
    const { email, firstName, lastName, googleId } = googleUser;
    const user = await this.userModel.findOne({ googleId });

    if (user) {
      return user;
    }

    const newUser = await this.userModel.create({
      email,
      userName: firstName + '' + lastName,
      googleId,
    });

    return newUser;
  }

  public async findUserByGoogleId(googleId: string) {
    return await this.userModel.findOne({ googleId });
  }

  public async findUserById(id: Types.ObjectId) {
    return await this.userModel.findById(id);
  }
}
