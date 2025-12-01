import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './otp.schema';

type MailEntity = {
  email: string;
  target: 'admin' | 'user';
};

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name)
    private readonly otpModel: Model<Otp>,
  ) {}

  public generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public async createOTP(entity: MailEntity) {
    const code = this.generateOTP();
    await this.otpModel.create({
      email: entity.email,
      target: entity.target,
      otp: code,
    });

    return code;
  }

  public async validateOTP(
    code: string,
    email: string,
    target: 'user' | 'admin',
  ) {
    const otpEntity = await this.otpModel.findOne({
      target,
      email,
      otp: code,
      isUsed: false,
    });

    if (!otpEntity) {
      throw new BadRequestException(
        'OTP expired or invalid. Please request a new OTP.',
      );
    }

    if (otpEntity.expiresAt <= new Date()) {
      throw new BadRequestException('OTP Expired, Please request a new OTP');
    }

    otpEntity.isUsed = true;
    await otpEntity.save();
    return true;
  }
}
