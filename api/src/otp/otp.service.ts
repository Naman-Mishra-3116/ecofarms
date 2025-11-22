import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from './otp.schema';
import { Model } from 'mongoose';

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
}
