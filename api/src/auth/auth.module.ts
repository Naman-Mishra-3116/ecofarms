import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AuthService } from './auth.service';
import { UserAuthController } from './user-auth.controller';
import { BcryptService } from './providers/bcrypt.provider';

@Module({
  controllers: [UserAuthController, AdminAuthController],
  providers: [AuthService, BcryptService],
})
export class AuthModule {}


