import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true })
  paymentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Upload', required: true })
  invoiceDocId: Types.ObjectId;

  @Prop({ type: String, required: true })
  invoiceNumber: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
export type InvoiceDocument = HydratedDocument<Invoice>;
