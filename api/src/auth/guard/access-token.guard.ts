import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtConfigService } from 'src/jwtconfig/jwtconfig.service';
import { ACTIVE_PERSON, PERMIT } from 'src/utils/constants';
import { Auth } from 'src/utils/enums/auth.enum';
import { Cookie } from 'src/utils/enums/cookie.enum';
import { Token } from 'src/utils/enums/token.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtConfigService: JwtConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride(PERMIT, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const roleToCookie = {
      [Auth.Admin]: Cookie.AdminAccess,
      [Auth.User]: Cookie.UserAccess,
    };

    const role: Auth = requiredRoles[0];
    const cookieToUse = roleToCookie[role];
    const { cookie, req } = await this.jwtConfigService.extractToken(
      context,
      cookieToUse,
    );

    if (!cookie) {
      throw new UnauthorizedException('Unauthorized');
    }

    const payload: Payload = await this.jwtConfigService.verifyToken(
      cookie,
      role === Auth.Admin ? Token.AccessAdmin : Token.AccessUser,
    );

    if (!payload) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (payload.role !== role) {
      throw new ForbiddenException('Access Forbidden');
    }

    const data = {
      email: payload.email,
      id: payload.id,
      role: payload.role,
    };

    req[ACTIVE_PERSON] = data;
    return true;
  }
}
