import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true, type: String })
  userName: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: false, type: String })
  password?: string;

  @Prop({ required: false, type: String, unique: true, sparse: true })
  googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
