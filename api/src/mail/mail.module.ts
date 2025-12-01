import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (conf: ConfigService) => {
        return {
          transport: {
            host: conf.get('mail.host'),
            port: conf.get('mail.port'),
            secure: false,
            auth: {
              user: conf.get('mail.user'),
              pass: conf.get('mail.password'),
            },
          },
          defaults: {
            from: '<no-reply@example.com>',
          },
          template: {
            dir: join(__dirname, 'template'),
            adapter: new EjsAdapter({ inlineCssEnabled: true }),
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
