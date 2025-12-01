import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './jwtconfig.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (conf: ConfigService) => {
        return {
          global: true,
          secret: conf.get('jwt.secret'),
          signOptions: {
            audience: conf.get('jwt.audience'),
            issuer: conf.get('jwt.issuer'),
          },
        };
      },
    }),
  ],

  exports: [JwtModule, JwtConfigService],
  providers: [JwtConfigService],
})
export class JwtconfigModule {}
