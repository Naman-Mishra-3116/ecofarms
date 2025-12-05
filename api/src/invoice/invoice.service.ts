import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}

  public async createInvoice(
    docId: Types.ObjectId,
    paymentDocId: Types.ObjectId,
    invoiceNumber: string,
  ) {
    return await this.invoiceModel.create({
      paymentId: paymentDocId,
      invoiceDocId: docId,
      invoiceNumber,
    });
  }
}
