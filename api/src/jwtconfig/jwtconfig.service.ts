import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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

  public async generateToken(user: { email: string; id: string }, type: Token) {
    const secret = this.configService.get('jwt.secret');
    const { expiresIn, payload } = this.getPayload(user, type);
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return token;
  }

  public async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secret'),
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  public async extractToken(context: ExecutionContext, type: Token) {
    const req = context.switchToHttp().getRequest();
    const cookie = req.cookies[type];
    return cookie;
  }
}
