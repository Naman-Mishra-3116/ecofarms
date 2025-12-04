import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtConfigService } from 'src/shared/jwtconfig/jwtconfig.service';
import { RESET_USER } from 'src/utils/constants';
import { Cookie } from 'src/utils/enums/cookie.enum';
import { Token } from 'src/utils/enums/token.enum';

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  constructor(private readonly jwtConfigService: JwtConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { cookie, req } = await this.jwtConfigService.extractToken(
      context,
      Cookie.ResetCookie,
    );

    if (!cookie) {
      throw new BadRequestException('Reset token not found');
    }

    const payload: { email: string } = await this.jwtConfigService.verifyToken(
      cookie,
      Token.Reset,
    );

    if (!payload) {
      throw new BadRequestException('Payload missing or not found');
    }

    req[RESET_USER] = payload;
    return true;
  }
}
