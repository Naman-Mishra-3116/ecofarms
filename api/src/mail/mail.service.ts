import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendOTPMail(
    entity: { email: string; userName: string },
    otp: number,
  ) {
    try {
      const { email, userName } = entity;
      const info = await this.mailerService.sendMail({
        to: email,
        date: new Date(),
        from: '<vrakshalaya@gmail.com>',
        template: '/otp',
        subject: 'Password Reset OTP',
        context: {
          otp,
          userName,
          year: new Date().getFullYear()
        },
      });

      if (info) {
        return true;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}
