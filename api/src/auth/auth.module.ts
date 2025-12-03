import { Module } from '@nestjs/common';
import { JwtconfigModule } from 'src/jwtconfig/jwtconfig.module';
import { AdminAuthController } from './routes/admin-auth.controller';
import { AuthService } from './auth.service';
import { BcryptService } from './providers/bcrypt.provider';
import { OtpModule } from 'src/otp/otp.module';
import { UserAuthController } from './routes/user-auth.controller';
import { GoogleAuthProvider } from './providers/google-auth.provider';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [JwtconfigModule, OtpModule, UserModule],
  controllers: [UserAuthController, AdminAuthController],
  providers: [AuthService, BcryptService, GoogleAuthProvider],
})
export class AuthModule {}
