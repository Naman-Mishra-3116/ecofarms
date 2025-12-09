import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Receipt {
  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true })
  paymentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Upload', required: true })
  receiptDocId: Types.ObjectId;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
export type ReceiptDocument = HydratedDocument<Receipt>;
