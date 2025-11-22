import { Module } from '@nestjs/common';
import { JwtconfigModule } from 'src/jwtconfig/jwtconfig.module';
import { AdminAuthController } from './admin-auth.controller';
import { AuthService } from './auth.service';
import { BcryptService } from './providers/bcrypt.provider';
import { UserAuthController } from './user-auth.controller';

@Module({
  imports: [JwtconfigModule],
  controllers: [UserAuthController, AdminAuthController],
  providers: [AuthService, BcryptService],
})
export class AuthModule {}
