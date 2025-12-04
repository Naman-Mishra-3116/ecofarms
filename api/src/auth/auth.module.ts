import { Module } from '@nestjs/common';
import { JwtconfigModule } from 'src/shared/jwtconfig/jwtconfig.module';
import { OtpModule } from 'src/otp/otp.module';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { BcryptService } from './providers/bcrypt.provider';
import { GoogleAuthProvider } from './providers/google-auth.provider';
import { AdminAuthController } from './routes/admin-auth.controller';
import { UserAuthController } from './routes/user-auth.controller';

@Module({
  imports: [JwtconfigModule, OtpModule, UserModule],
  controllers: [UserAuthController, AdminAuthController],
  providers: [AuthService, BcryptService, GoogleAuthProvider],
})
export class AuthModule {}
