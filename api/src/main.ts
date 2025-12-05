import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: '*',
  });
  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        if (req.originalUrl.includes('razorpay/webhook')) {
          req.rawBody = buf;
        }
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
