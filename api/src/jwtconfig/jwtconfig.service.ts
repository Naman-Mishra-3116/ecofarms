import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Cookie } from 'src/utils/enums/cookie.enum';
import { Token } from 'src/utils/enums/token.enum';

@Injectable()
export class JwtConfigService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getPayload(entity: { id: string; email: string }, type: Token) {
    const configuration = {
      [Token.AccessUser]: {
        expiresIn: this.configService.get('jwt.userAccessExpiry'),
        payload: {
          role: 'user',
          id: entity.id,
          email: entity.email,
        },
      },

      [Token.AccessAdmin]: {
        expiresIn: this.configService.get('jwt.adminAccessExpiry'),
        payload: {
          role: 'admin',
          id: entity.id,
          email: entity.email,
        },
      },

      [Token.Refresh]: {
        expiresIn: this.configService.get('jwt.refreshExpiry'),
        payload: {
          id: entity.id,
        },
      },

      [Token.Reset]: {
        expiresIn: this.configService.get('jwt.resetExpiry'),
        payload: {
          email: entity.email,
        },
      },

      [Token.Otp]: {
        expiresIn: this.configService.get('jwt.resetExpiry'),
        payload: {
          email: entity.email,
        },
      },
    };

    const { expiresIn, payload } = configuration[type];
    return { expiresIn, payload };
  }

  public async generateToken(
    entity: { email: string; id: string },
    type: Token,
  ) {
    const secret = this.configService.get('jwt.secret');
    const { expiresIn, payload } = this.getPayload(entity, type);
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return token;
  }

  public async verifyToken(token: string, tokenType: Token) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secret'),
      });
      return payload;
    } catch (error) {
      switch (tokenType) {
        case Token.AccessUser:
        case Token.AccessAdmin:
        case Token.Refresh:
          throw new UnauthorizedException(error.message);

        case Token.Otp:
        case Token.Reset:
          throw new BadRequestException('OTP or Reset Token expired');
      }
    }
  }

  public async extractToken(
    context: ExecutionContext,
    type: Cookie,
  ): Promise<{ cookie: string; req: Request }> {
    const req = context.switchToHttp().getRequest();
    const cookie = req.cookies[type];
    return { cookie, req };
  }

  public setCookies(name: Cookie, value: string, res: Response) {
    try {
      const age = {
        [Cookie.UserAccess]:
          this.configService.get('jwt.userAccessExpiry') * 1000,
        [Cookie.UserRefresh]:
          this.configService.get('jwt.refreshExpiry') * 1000,
        [Cookie.AdminAccess]:
          this.configService.get('jwt.adminAccessExpiry') * 1000,
        [Cookie.OtpCookie]: this.configService.get('jwt.resetExpiry') * 1000,
        [Cookie.ResetCookie]: this.configService.get('jwt.resetExpiry') * 1000,
      };

      res.cookie(name, value, {
        sameSite: 'strict',
        secure: true,
        httpOnly: true,
        maxAge: age[name],
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  public async generateUserAuthTokens(entity: { email: string; id: string }) {
    const accessToken = await this.generateToken(entity, Token.AccessUser);
    const refreshToken = await this.generateToken(entity, Token.Refresh);
    return { accessToken, refreshToken };
  }

  
}
