import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PAYMENT_STATUS } from 'src/utils/enums/payment.enum';

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ type: String })
  orderId: string;

  @Prop({ type: String })
  paymentId: string;

  @Prop({ type: String })
  signature: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: String, default: 'INR', required: false })
  currency: string;

  @Prop({ default: PAYMENT_STATUS.PENDING, enum: PAYMENT_STATUS })
  status: PAYMENT_STATUS;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
export type PaymentDocument = HydratedDocument<Payment>;
