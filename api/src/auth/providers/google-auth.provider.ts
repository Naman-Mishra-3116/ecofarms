import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { JwtConfigService } from 'src/shared/jwtconfig/jwtconfig.service';
import { UserService } from 'src/user/user.service';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { Cookie } from 'src/utils/enums/cookie.enum';
import { GoogleUser } from 'src/user/interface/google-user.interface';

@Injectable()
export class GoogleAuthProvider implements OnModuleInit {
  private googleClient: OAuth2Client;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtConfigService: JwtConfigService,
    private readonly userService: UserService,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get('google.client');
    const clientSecret = this.configService.get('google.secret');
    this.googleClient = new OAuth2Client({
      client_id: clientId,
      client_secret: clientSecret,
    });
  }

  public async authenticate(googleLoginDto: GoogleLoginDto, res: Response) {
    const loginTicket = await this.googleClient.verifyIdToken({
      idToken: googleLoginDto.token,
    });

    const {
      email,
      sub: googleId,
      given_name: firstName,
      family_name: lastName,
    } = loginTicket.getPayload() as TokenPayload;

    const user = await this.userService.findOneOrCreateUser({
      email,
      googleId,
      firstName,
      lastName,
    } as GoogleUser);

    if (!user) {
      throw new ConflictException(
        'Could not create Account!, Please try again later',
      );
    }

    const payload = { email: user.email, id: user._id.toString() };
    const tokensSet = await this.generateTokenAndSetCookies(payload, res);

    if (tokensSet) {
      return {
        success: true,
        error: false,
        message: 'Logged in successfully',
        email: user.email,
      };
    }
  }

  private async generateTokenAndSetCookies(
    user: { email: string; id: string },
    res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.jwtConfigService.generateUserAuthTokens(user);

    const accessCookie = this.jwtConfigService.setCookies(
      Cookie.UserAccess,
      accessToken,
      res,
    );

    const refreshCookie = this.jwtConfigService.setCookies(
      Cookie.UserRefresh,
      refreshToken,
      res,
    );

    return accessCookie && refreshCookie;
  }
}
