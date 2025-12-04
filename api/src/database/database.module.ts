import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from 'src/admin/admin.schema';
import { Otp, OtpSchema } from 'src/otp/otp.schema';
import { Payment, PaymentSchema } from 'src/payment/payment.schema';
import { User, UserSchema } from 'src/user/user.schema';

const ENTITIES: ModelDefinition[] = [
  { name: User.name, schema: UserSchema },
  { name: Otp.name, schema: OtpSchema },
  { name: Admin.name, schema: AdminSchema },
  { name: Payment.name, schema: PaymentSchema },
];

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

    MongooseModule.forFeature(ENTITIES),
  ],

  exports: [MongooseModule],
})
export class DatabaseModule {}
