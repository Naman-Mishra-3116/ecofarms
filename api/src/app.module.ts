import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtconfigModule } from './jwtconfig/jwtconfig.module';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';
import { PaymentModule } from './payment/payment.module';
import envConfig from './utils/config/env.config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guard/access-token.guard';

const ENV_TYPE = process.env.NODE_ENV?.trim();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV_TYPE ? `.env.${ENV_TYPE}` : '.env',
      load: [envConfig],
    }),
    DatabaseModule,
    AdminModule,
    UserModule,
    AuthModule,
    JwtconfigModule,
    OtpModule,
    MailModule,
    PaymentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
