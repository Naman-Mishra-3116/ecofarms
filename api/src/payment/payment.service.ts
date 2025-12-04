import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Razorpay from 'razorpay';
import { RAZORPAY_CLIENT } from 'src/utils/constants';
import { PAYMENT_STATUS } from 'src/utils/enums/payment.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SuccessPaymentDto } from './dto/success-payment.dto';
import { Payment, PaymentDocument } from './payment.schema';
import { ValidatePaymentSignature } from './providers/validate-signature.provider';
import axios from 'axios';
import { UploadsService } from 'src/shared/uploads/uploads.service';
import { FileType, UploadFolder } from 'src/utils/enums/upload.enum';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(RAZORPAY_CLIENT)
    private readonly paymentClient: Razorpay,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly validateSignature: ValidatePaymentSignature,
    private readonly uploadService: UploadsService,
    private readonly invoiceService: InvoiceService,
  ) {}

  public async createPayment(data: CreatePaymentDto) {
    const { userId, amount, productId, quantity } = data;
    const payableAmount = quantity * amount;
    const order = await this.paymentClient.orders.create({
      amount: payableAmount * 100,
      currency: 'INR',
    });

    const created = await this.paymentModel.create({
      userId: new Types.ObjectId(userId),
      quantity,
      productId,
      amount: payableAmount,
      currency: 'INR',
      orderId: order.id,
      status: PAYMENT_STATUS.PENDING,
    });

    return {
      _id: created._id.toString(),
      orderId: order.id,
      amount: order.amount,
    };
  }

  public async paymentSuccess(data: SuccessPaymentDto) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    const paymentDbId = new Types.ObjectId(data.paymentDbId);
    const order = this.paymentModel.findById(paymentDbId);

    if (!order) {
      throw new BadRequestException('Order not found!');
    }

    const isSignatureValid = this.validateSignature.validatePaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isSignatureValid) {
      await this.paymentModel.findByIdAndUpdate(paymentDbId, {
        status: PAYMENT_STATUS.FAILED,
      });
      throw new BadRequestException('Invalid signature');
    }

    const updatedPayment = await this.paymentModel.findByIdAndUpdate(
      paymentDbId,
      {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        status: PAYMENT_STATUS.SUCCESS,
      },
      { new: true },
    );

    const invoices = await this.paymentClient.invoices.all({
      payment_id: razorpay_payment_id,
    });

    if (!invoices.items.length) {
      throw new BadRequestException('No invoice found for this order');
    }

    const invoice = invoices.items[0];
    const file = await this.getInvoiceBuffer(
      invoice.short_url as string,
      paymentDbId,
    );

    const invoiceDocId = await this.uploadService.uploadFileService(
      file,
      UploadFolder.Invoice,
      FileType.Pdf,
    );

    const invoiceDoc = await this.invoiceService.createInvoice(
      invoiceDocId,
      paymentDbId,
      invoice.id,
    );

    return {
      status: 'success',
      error: false,
      success: true,
      message: 'Payment verified successfully',
      data: updatedPayment,
    };
  }

  public async getInvoiceBuffer(url: string, paymentDbId: Types.ObjectId) {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);
    return {
      originalname: `invoice-${paymentDbId}.pdf`,
      buffer,
      mimetype: 'application/pdf',
      size: buffer.length,
    } as Express.Multer.File;
  }
}
