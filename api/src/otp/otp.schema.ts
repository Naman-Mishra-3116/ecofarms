import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Otp {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  otp: string;

  @Prop({ required: true, enum: ['user', 'admin'], type: String })
  target: 'user' | 'admin';

  @Prop({ default: false, type: Boolean })
  isUsed: boolean;

  @Prop({
    required: true,
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000),
  })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
export type OtpDocument = HydratedDocument<Otp>;
