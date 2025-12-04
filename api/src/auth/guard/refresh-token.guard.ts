import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtConfigService } from 'src/jwtconfig/jwtconfig.service';
import { REFRESH_USER } from 'src/utils/constants';
import { Cookie } from 'src/utils/enums/cookie.enum';
import { Token } from 'src/utils/enums/token.enum';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private readonly jwtConfigService: JwtConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { cookie, req } = await this.jwtConfigService.extractToken(
      context,
      Cookie.UserRefresh,
    );

    if (!cookie) {
      throw new UnauthorizedException('Unauthorized');
    }

    const payload: RefreshPayload = await this.jwtConfigService.verifyToken(
      cookie,
      Token.Refresh,
    );

    if (!payload) {
      throw new UnauthorizedException('Unauthorized');
    }

    req[REFRESH_USER] = payload;
    return true;
  }
}
