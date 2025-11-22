import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          uri: config.get('database.uri'),
        };
      },
    }),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  exports: [MongooseModule],
})
export class DatabaseModule {}
