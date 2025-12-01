import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtConfigService } from 'src/jwtconfig/jwtconfig.service';
import { OTP_USER } from 'src/utils/constants';
import { Cookie } from 'src/utils/enums/cookie.enum';
import { Token } from 'src/utils/enums/token.enum';

@Injectable()
export class VerifyOTPGuard implements CanActivate {
  constructor(private readonly jwtConfigService: JwtConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { cookie, req } = await this.jwtConfigService.extractToken(
      context,
      Cookie.OtpCookie,
    );

    if (!cookie) {
      throw new BadRequestException('cookie missing or not provided');
    }

    const payload: { email: string } = await this.jwtConfigService.verifyToken(
      cookie,
      Token.Otp,
    );

    if (!payload) {
      throw new BadRequestException('otp token expired');
    }

    req[OTP_USER] = payload;
    return true;
  }
}
