import { Injectable } from '@nestjs/common';
import { ReceiptDocument, Receipt } from './receipt.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import qrCode from 'qrcode';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectModel(Receipt.name)
    private readonly receiptModel: Model<ReceiptDocument>,
    private readonly configService: ConfigService,
  ) {}

  public async createReceipt(
    docId: Types.ObjectId,
    paymentDocId: Types.ObjectId,
  ) {
    return await this.receiptModel.create({
      paymentId: paymentDocId,
      receiptDocId: docId,
    });
  }

  public async getQrCodeForReceipt(paymentDocId: Types.ObjectId) {
    const verifyLink = this.configService.get('client.qrLink');
    const actualLink = verifyLink.replace(':paymentId', paymentDocId);
    const qrCodeImage = await qrCode.toDataURL(actualLink);
    return qrCodeImage;
  }

}
